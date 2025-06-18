
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionState {
  subscribed: boolean;
  planType: 'free_trial' | 'free' | 'premium';
  subscriptionEnd: string | null;
  trialEndDate: string | null;
  isLoading: boolean;
}

interface SubscriptionContextType extends SubscriptionState {
  checkSubscription: () => Promise<void>;
  createCheckout: (priceId: string) => Promise<void>;
  openCustomerPortal: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SubscriptionState>({
    subscribed: false,
    planType: 'free_trial',
    subscriptionEnd: null,
    trialEndDate: null,
    isLoading: false,
  });

  const { user, isAuthenticated } = useAuth();
  const [hasInitialized, setHasInitialized] = useState(false);

  const log = (message: string) => {
    console.log(`[SUBSCRIPTION] ${message}`);
  };

  // Handle URL parameters from Stripe checkout
  const handleCheckoutReturn = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasCheckoutParams = urlParams.has('success') || urlParams.has('canceled');
    
    if (hasCheckoutParams) {
      log('Checkout return detected, cleaning URL');
      // Clean URL without page reload
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      
      // If success, trigger subscription check
      if (urlParams.get('success') === 'true') {
        log('Checkout successful, will verify subscription');
        // Small delay to ensure Stripe has processed
        setTimeout(() => {
          checkSubscription();
        }, 2000);
      }
    }
  }, []);

  const checkSubscription = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      log('Starting subscription check');
      setState(prev => ({ ...prev, isLoading: true }));

      // Get trial info from Supabase
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      let trialEndDate = null;
      let planType: 'free_trial' | 'free' | 'premium' = 'free_trial';

      if (subscription?.trial_end_date) {
        trialEndDate = subscription.trial_end_date;
        const trialEnd = new Date(subscription.trial_end_date);
        const currentTime = new Date();
        
        if (currentTime < trialEnd) {
          planType = 'free_trial';
          log('User in trial period');
        } else {
          planType = 'free';
          log('Trial expired, free plan');
        }
      } else {
        // Create new trial
        const newTrialEnd = new Date();
        newTrialEnd.setDate(newTrialEnd.getDate() + 7);
        trialEndDate = newTrialEnd.toISOString();
        planType = 'free_trial';

        await supabase
          .from('subscriptions')
          .upsert({
            user_id: user.id,
            trial_end_date: trialEndDate,
            plan_type: 'free_trial',
            updated_at: new Date().toISOString()
          });
        
        log('New trial created');
      }

      // Check Stripe subscription with timeout
      let isSubscribed = false;
      let subscriptionEnd = null;
      let finalPlanType: 'free_trial' | 'free' | 'premium' = planType;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const { data: stripeData } = await supabase.functions.invoke('check-subscription', {
          headers: { 'Content-Type': 'application/json' },
        });
        
        clearTimeout(timeoutId);
        
        if (stripeData?.subscribed) {
          isSubscribed = true;
          finalPlanType = 'premium';
          subscriptionEnd = stripeData.subscription_end;
          log('Active subscription found');
        }
      } catch (error) {
        log('Stripe check failed, using local data');
      }

      setState({
        subscribed: isSubscribed,
        planType: finalPlanType,
        subscriptionEnd,
        trialEndDate,
        isLoading: false,
      });

      log('Subscription check completed');

    } catch (error: any) {
      log(`Error checking subscription: ${error.message}`);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [isAuthenticated, user?.id]);

  const createCheckout = async (priceId: string) => {
    if (!priceId || typeof priceId !== 'string') {
      throw new Error('Invalid price ID');
    }

    try {
      log('Creating checkout for: ' + priceId);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId }
      });

      if (error) throw error;

      if (data?.url) {
        log('Opening checkout in new tab');
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      throw error;
    }
  };

  const openCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      throw error;
    }
  };

  // Initialize subscription check
  useEffect(() => {
    if (isAuthenticated && user && !hasInitialized) {
      log('Initializing subscription context');
      setHasInitialized(true);
      
      // Handle checkout return first
      handleCheckoutReturn();
      
      // Then check subscription
      const timer = setTimeout(() => {
        checkSubscription();
      }, 500);
      
      return () => clearTimeout(timer);
    } else if (!isAuthenticated) {
      // Reset state when user logs out
      setState({
        subscribed: false,
        planType: 'free_trial',
        subscriptionEnd: null,
        trialEndDate: null,
        isLoading: false,
      });
      setHasInitialized(false);
      log('State reset - user not authenticated');
    }
  }, [isAuthenticated, user?.id, hasInitialized, checkSubscription, handleCheckoutReturn]);

  // Listen for page visibility changes to refresh subscription when user returns
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated && user && hasInitialized) {
        log('Page became visible, checking for subscription updates');
        checkSubscription();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated, user, hasInitialized, checkSubscription]);

  return (
    <SubscriptionContext.Provider value={{
      ...state,
      checkSubscription,
      createCheckout,
      openCustomerPortal,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
