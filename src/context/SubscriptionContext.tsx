
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
    isLoading: true,
  });

  const { user, isAuthenticated } = useAuth();

  // Check subscription status
  const checkSubscription = async () => {
    if (!isAuthenticated || !user) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
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
        const now = new Date();
        
        // Se o período de teste ainda não expirou
        if (now < trialEnd) {
          planType = 'free_trial';
        } else {
          planType = 'free';
        }
      } else {
        // Se não há data de fim do teste, criar uma nova (7 dias a partir de agora)
        const newTrialEnd = new Date();
        newTrialEnd.setDate(newTrialEnd.getDate() + 7);
        trialEndDate = newTrialEnd.toISOString();
        planType = 'free_trial';

        // Atualizar no banco de dados
        await supabase
          .from('subscriptions')
          .upsert({
            user_id: user.id,
            trial_end_date: trialEndDate,
            plan_type: 'free_trial',
            updated_at: new Date().toISOString()
          });
      }

      // Check Stripe subscription status
      const { data: stripeData, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        setState(prev => ({ 
          ...prev, 
          isLoading: false,
          planType,
          trialEndDate
        }));
        return;
      }

      setState({
        subscribed: stripeData.subscribed || false,
        planType: stripeData.subscribed ? 'premium' : planType,
        subscriptionEnd: stripeData.subscription_end,
        trialEndDate,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error in checkSubscription:', error);
      setState(prev => ({ ...prev, isLoading: false }));
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

  // Check subscription on auth state change
  useEffect(() => {
    if (isAuthenticated) {
      checkSubscription();
    } else {
      setState({
        subscribed: false,
        planType: 'free_trial',
        subscriptionEnd: null,
        trialEndDate: null,
        isLoading: false,
      });
    }
  }, [isAuthenticated, user]);

  // Check for URL parameters (success/cancel)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      setTimeout(() => {
        checkSubscription();
      }, 2000); // Give Stripe time to process
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
