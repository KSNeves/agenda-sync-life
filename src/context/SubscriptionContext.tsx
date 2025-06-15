
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
  
  // Track if a check is already in progress to prevent multiple concurrent calls
  const [isCheckingInProgress, setIsCheckingInProgress] = useState(false);

  // Check subscription status
  const checkSubscription = async () => {
    if (!isAuthenticated || !user || isCheckingInProgress) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setIsCheckingInProgress(true);
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

      // Check Stripe subscription status with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      );

      const stripeCheckPromise = supabase.functions.invoke('check-subscription');
      
      let stripeData = null;
      try {
        const result = await Promise.race([stripeCheckPromise, timeoutPromise]);
        stripeData = result.data;
      } catch (error) {
        console.error('Error checking Stripe subscription (using fallback):', error);
        // Continue with trial/local data if Stripe check fails
      }

      // Se não está subscrito no Stripe mas o trial ainda está ativo, manter o trial
      let finalPlanType: 'free_trial' | 'free' | 'premium' = planType;
      let subscriptionEnd = null;
      let isSubscribed = false;

      if (stripeData?.subscribed) {
        finalPlanType = 'premium';
        subscriptionEnd = stripeData.subscription_end;
        isSubscribed = true;
      } else if (planType === 'free_trial') {
        // Verificar se o trial realmente ainda está ativo
        const trialEnd = new Date(trialEndDate);
        const now = new Date();
        if (now >= trialEnd) {
          finalPlanType = 'free';
        }
      }

      setState({
        subscribed: isSubscribed,
        planType: finalPlanType,
        subscriptionEnd,
        trialEndDate,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error in checkSubscription:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    } finally {
      setIsCheckingInProgress(false);
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
    if (isAuthenticated && user && !isCheckingInProgress) {
      checkSubscription();
    } else if (!isAuthenticated) {
      setState({
        subscribed: false,
        planType: 'free_trial',
        subscriptionEnd: null,
        trialEndDate: null,
        isLoading: false,
      });
      setIsCheckingInProgress(false);
    }
  }, [isAuthenticated, user]);

  // Check for URL parameters (success/cancel) - only once
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      // Clear URL params immediately
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Delay check to give Stripe time to process
      setTimeout(() => {
        if (isAuthenticated && user && !isCheckingInProgress) {
          checkSubscription();
        }
      }, 3000);
    }
  }, []); // Empty dependency array to run only once

  // Verificar status da assinatura periodicamente - com controle de frequência
  useEffect(() => {
    if (!isAuthenticated || isCheckingInProgress) return;

    const interval = setInterval(() => {
      if (!isCheckingInProgress) {
        checkSubscription();
      }
    }, 60000); // Reduzido para 60 segundos para evitar spam

    return () => clearInterval(interval);
  }, [isAuthenticated, isCheckingInProgress]);

  // Verificar quando a página ganha foco - com debounce
  useEffect(() => {
    if (!isAuthenticated) return;

    let focusTimeout: NodeJS.Timeout;
    
    const handleFocus = () => {
      clearTimeout(focusTimeout);
      focusTimeout = setTimeout(() => {
        if (!isCheckingInProgress) {
          checkSubscription();
        }
      }, 1000); // Debounce de 1 segundo
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearTimeout(focusTimeout);
    };
  }, [isAuthenticated, isCheckingInProgress]);

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
