
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
    isLoading: false, // Start with false to prevent initial loading
  });

  const { user, isAuthenticated } = useAuth();
  
  // Simple flag to prevent multiple calls
  const [checking, setChecking] = useState(false);

  // Simple debug log
  const log = (message: string) => {
    console.log(`[SUBSCRIPTION] ${message}`);
  };

  // Force stop loading after maximum time
  useEffect(() => {
    if (state.isLoading) {
      const timeout = setTimeout(() => {
        log('Force stopping loading state after timeout');
        setState(prev => ({ ...prev, isLoading: false }));
      }, 10000); // 10 seconds max
      
      return () => clearTimeout(timeout);
    }
  }, [state.isLoading]);

  // Simplified check subscription
  const checkSubscription = async () => {
    if (!isAuthenticated || !user || checking) {
      log('Skipping check - not authenticated or already checking');
      return;
    }

    try {
      log('Starting subscription check');
      setChecking(true);
      setState(prev => ({ ...prev, isLoading: true }));

      // Get trial info from Supabase only
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

      // Try Stripe check with very short timeout
      let isSubscribed = false;
      let subscriptionEnd = null;
      let finalPlanType = planType;

      try {
        log('Checking Stripe subscription');
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 3000) // 3 seconds only
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
        // Continue with local data only
      }

      setState({
        subscribed: isSubscribed,
        planType: finalPlanType,
        subscriptionEnd,
        trialEndDate,
        isLoading: false,
      });

      log('Subscription check completed successfully');

    } catch (error: any) {
      log(`Error in checkSubscription: ${error.message}`);
      setState(prev => ({ ...prev, isLoading: false }));
    } finally {
      setChecking(false);
    }
  };

  // Create checkout session
  const createCheckout = async (priceId: string) => {
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

  // Open customer portal
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

  // Only check on initial auth change
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
  }, [isAuthenticated, user?.id]); // Only depend on essential auth changes

  // Check for checkout success URL parameter only once
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      log('Checkout success detected');
      // Clean URL immediately
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Wait a bit then check subscription
      setTimeout(() => {
        if (isAuthenticated && user && !checking) {
          checkSubscription();
        }
      }, 2000);
    }
  }, []); // Run only once

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
