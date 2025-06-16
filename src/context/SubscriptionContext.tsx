import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  const [checking, setChecking] = useState(false);

  const log = (message: string) => {
    console.log(`[SUBSCRIPTION] ${message}`);
  };

  // Force stop loading after timeout
  useEffect(() => {
    if (state.isLoading) {
      const timeout = setTimeout(() => {
        log('Force stopping loading state after timeout');
        setState(prev => ({ ...prev, isLoading: false }));
      }, 15000);
      
      return () => clearTimeout(timeout);
    }
  }, [state.isLoading]);

  const checkSubscription = async () => {
    if (!isAuthenticated || !user || checking) {
      log('Skipping check - not authenticated or already checking');
      return;
    }

    try {
      log('Starting subscription check');
      setChecking(true);
      setState(prev => ({ ...prev, isLoading: true }));

      // Get trial info from Supabase
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      log('Got subscription data');

      let trialEndDate = null;
      let planType: 'free_trial' | 'free' | 'premium' = 'free_trial';

      if (subscription?.trial_end_date) {
        trialEndDate = subscription.trial_end_date;
        const trialEnd = new Date(subscription.trial_end_date);
        const currentTime = new Date();
        
        if (currentTime < trialEnd) {
          planType = 'free_trial';
        } else {
          planType = 'free';
        }
      } else {
        // Create new trial period
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
      }

      // Try Stripe check with timeout
      let isSubscribed = false;
      let subscriptionEnd = null;
      let finalPlanType = planType;

      try {
        log('Checking Stripe subscription');
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        );

        const stripeCheckPromise = supabase.functions.invoke('check-subscription');
        const result = await Promise.race([stripeCheckPromise, timeoutPromise]) as any;
        
        if (result?.data?.subscribed) {
          isSubscribed = true;
          finalPlanType = 'premium';
          subscriptionEnd = result.data.subscription_end;
          log('Found active Stripe subscription');
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
      log(`Error in checkSubscription: ${error.message}`);
      setState(prev => ({ ...prev, isLoading: false }));
    } finally {
      setChecking(false);
    }
  };

  const createCheckout = async (priceId: string) => {
    // Input validation
    if (!priceId || typeof priceId !== 'string') {
      throw new Error('Invalid price ID');
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId }
      });

      if (error) throw error;

      if (data?.url) {
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

  // Check subscription on auth change
  useEffect(() => {
    if (isAuthenticated && user && !checking) {
      log('Auth state changed - checking subscription');
      checkSubscription();
    } else if (!isAuthenticated) {
      log('User logged out - resetting state');
      setState({
        subscribed: false,
        planType: 'free_trial',
        subscriptionEnd: null,
        trialEndDate: null,
        isLoading: false,
      });
      setChecking(false);
    }
  }, [isAuthenticated, user?.id]);

  // Handle checkout success
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      log('Checkout success detected');
      window.history.replaceState({}, document.title, window.location.pathname);
      
      setTimeout(() => {
        if (isAuthenticated && user && !checking) {
          checkSubscription();
        }
      }, 2000);
    }
  }, []);

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
