
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
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
  const checkingRef = useRef(false);
  const mountedRef = useRef(true);

  const log = (message: string) => {
    console.log(`[SUBSCRIPTION] ${message}`);
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Clear URL parameters immediately on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('success') || urlParams.has('canceled')) {
      const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      log('Cleared checkout URL parameters');
    }
  }, []);

  const checkSubscription = useCallback(async () => {
    if (!isAuthenticated || !user || checkingRef.current || !mountedRef.current) {
      return;
    }

    try {
      log('Starting subscription check');
      checkingRef.current = true;
      
      if (mountedRef.current) {
        setState(prev => ({ ...prev, isLoading: true }));
      }

      // Get trial info from Supabase
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!mountedRef.current) return;

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

      // Check Stripe subscription with timeout
      let isSubscribed = false;
      let subscriptionEnd = null;
      let finalPlanType: 'free_trial' | 'free' | 'premium' = planType;

      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Stripe timeout')), 3000)
        );

        const stripeCheckPromise = supabase.functions.invoke('check-subscription');
        const result = await Promise.race([stripeCheckPromise, timeoutPromise]) as any;
        
        if (result?.data?.subscribed) {
          isSubscribed = true;
          finalPlanType = 'premium';
          subscriptionEnd = result.data.subscription_end;
        }
      } catch (error) {
        log('Stripe check failed, using local data only');
      }

      if (mountedRef.current) {
        setState({
          subscribed: isSubscribed,
          planType: finalPlanType,
          subscriptionEnd,
          trialEndDate,
          isLoading: false,
        });
      }

    } catch (error: any) {
      log(`Error in checkSubscription: ${error.message}`);
      if (mountedRef.current) {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } finally {
      checkingRef.current = false;
    }
  }, [isAuthenticated, user?.id]);

  const createCheckout = async (priceId: string) => {
    if (!priceId || typeof priceId !== 'string') {
      throw new Error('Invalid price ID');
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId }
      });

      if (error) throw error;

      if (data?.url) {
        // Open in new tab
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

  // Check subscription on auth change - only once per session
  useEffect(() => {
    if (isAuthenticated && user && !checkingRef.current && mountedRef.current) {
      // Small delay to prevent race conditions
      const timer = setTimeout(() => {
        if (mountedRef.current && !checkingRef.current) {
          checkSubscription();
        }
      }, 100);
      
      return () => clearTimeout(timer);
    } else if (!isAuthenticated && mountedRef.current) {
      setState({
        subscribed: false,
        planType: 'free_trial',
        subscriptionEnd: null,
        trialEndDate: null,
        isLoading: false,
      });
      checkingRef.current = false;
    }
  }, [isAuthenticated, user?.id, checkSubscription]);

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
