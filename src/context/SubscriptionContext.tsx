
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
  
  // Controle mais rigoroso para prevenir múltiplas execuções
  const [isCheckingInProgress, setIsCheckingInProgress] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(0);

  // Função de log para debug
  const debugLog = (message: string, data?: any) => {
    console.log(`[SUBSCRIPTION-CONTEXT] ${message}`, data ? JSON.stringify(data) : '');
  };

  // Timeout para forçar saída do loading se demorar muito
  const forceStopLoading = () => {
    setTimeout(() => {
      setState(prev => {
        if (prev.isLoading) {
          debugLog('FORCE STOP: Loading timeout reached, stopping loading state');
          return { ...prev, isLoading: false };
        }
        return prev;
      });
    }, 15000); // 15 segundos máximo
  };

  // Check subscription status com controle rigoroso
  const checkSubscription = async () => {
    const now = Date.now();
    
    // Prevenir múltiplas execuções muito próximas (mínimo 3 segundos entre chamadas)
    if (now - lastCheckTime < 3000) {
      debugLog('BLOCKED: Check too soon after last check', { timeSince: now - lastCheckTime });
      return;
    }

    if (!isAuthenticated || !user) {
      debugLog('BLOCKED: User not authenticated');
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    if (isCheckingInProgress) {
      debugLog('BLOCKED: Check already in progress');
      return;
    }

    try {
      debugLog('STARTING subscription check', { userId: user.id });
      setIsCheckingInProgress(true);
      setLastCheckTime(now);
      setState(prev => ({ ...prev, isLoading: true }));

      // Iniciar timeout para forçar parada do loading
      forceStopLoading();

      // Get trial info from Supabase
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      debugLog('Got subscription data from Supabase', subscription);

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
        debugLog('Trial status determined', { planType, trialEnd: trialEnd.toISOString() });
      } else {
        // Criar novo período de teste
        const newTrialEnd = new Date();
        newTrialEnd.setDate(newTrialEnd.getDate() + 7);
        trialEndDate = newTrialEnd.toISOString();
        planType = 'free_trial';
        debugLog('Creating new trial period', { trialEndDate });

        await supabase
          .from('subscriptions')
          .upsert({
            user_id: user.id,
            trial_end_date: trialEndDate,
            plan_type: 'free_trial',
            updated_at: new Date().toISOString()
          });
      }

      // Check Stripe subscription status com timeout reduzido
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Stripe check timeout')), 8000) // 8 segundos
      );

      const stripeCheckPromise = supabase.functions.invoke('check-subscription');
      
      let stripeData = null;
      try {
        debugLog('Calling Stripe check-subscription');
        const result = await Promise.race([stripeCheckPromise, timeoutPromise]) as any;
        stripeData = result?.data;
        debugLog('Stripe check completed', stripeData);
      } catch (error: any) {
        debugLog('Stripe check failed (using fallback)', { error: error.message });
        // Continue com dados locais se Stripe falhar
      }

      // Determinar estado final
      let finalPlanType: 'free_trial' | 'free' | 'premium' = planType;
      let subscriptionEnd = null;
      let isSubscribed = false;

      if (stripeData?.subscribed) {
        finalPlanType = 'premium';
        subscriptionEnd = stripeData.subscription_end;
        isSubscribed = true;
        debugLog('User has active Stripe subscription');
      } else if (planType === 'free_trial') {
        const trialEnd = new Date(trialEndDate);
        const currentTime = new Date();
        if (currentTime >= trialEnd) {
          finalPlanType = 'free';
          debugLog('Trial period expired');
        } else {
          debugLog('Trial period still active');
        }
      }

      debugLog('Final subscription state', { 
        isSubscribed, 
        finalPlanType, 
        subscriptionEnd, 
        trialEndDate 
      });

      setState({
        subscribed: isSubscribed,
        planType: finalPlanType,
        subscriptionEnd,
        trialEndDate,
        isLoading: false,
      });

    } catch (error: any) {
      debugLog('ERROR in checkSubscription', { error: error.message });
      setState(prev => ({ ...prev, isLoading: false }));
    } finally {
      setIsCheckingInProgress(false);
      debugLog('Subscription check completed');
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

  // Check subscription on auth state change - só quando necessário
  useEffect(() => {
    debugLog('Auth state changed', { isAuthenticated, hasUser: !!user });
    
    if (isAuthenticated && user && !isCheckingInProgress) {
      debugLog('Triggering subscription check due to auth change');
      checkSubscription();
    } else if (!isAuthenticated) {
      debugLog('User logged out, resetting subscription state');
      setState({
        subscribed: false,
        planType: 'free_trial',
        subscriptionEnd: null,
        trialEndDate: null,
        isLoading: false,
      });
      setIsCheckingInProgress(false);
      setLastCheckTime(0);
    }
  }, [isAuthenticated, user?.id]);

  // Check for URL parameters (success/cancel) - apenas uma vez
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      debugLog('Checkout success detected, cleaning URL and scheduling check');
      
      // Limpar parâmetros da URL imediatamente
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Aguardar processamento do Stripe antes de verificar (reduzido para 2 segundos)
      setTimeout(() => {
        if (isAuthenticated && user && !isCheckingInProgress) {
          debugLog('Triggering subscription check after checkout success');
          checkSubscription();
        }
      }, 2000);
    }
  }, []);

  // Verificação periódica mais controlada - só se não estiver em loading infinito
  useEffect(() => {
    if (!isAuthenticated || isCheckingInProgress) return;

    debugLog('Setting up periodic subscription check');
    const interval = setInterval(() => {
      if (!isCheckingInProgress && Date.now() - lastCheckTime > 300000 && !state.isLoading) { // 5 minutos e não em loading
        debugLog('Periodic subscription check triggered');
        checkSubscription();
      }
    }, 300000); // 5 minutos

    return () => {
      debugLog('Clearing periodic check interval');
      clearInterval(interval);
    };
  }, [isAuthenticated, isCheckingInProgress, lastCheckTime, state.isLoading]);

  // Verificação no foco da página - com debounce maior e controle de loading
  useEffect(() => {
    if (!isAuthenticated) return;

    let focusTimeout: NodeJS.Timeout;
    
    const handleFocus = () => {
      clearTimeout(focusTimeout);
      focusTimeout = setTimeout(() => {
        if (!isCheckingInProgress && Date.now() - lastCheckTime > 60000 && !state.isLoading) { // 1 minuto e não em loading
          debugLog('Page focus check triggered');
          checkSubscription();
        }
      }, 3000); // Debounce de 3 segundos
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearTimeout(focusTimeout);
    };
  }, [isAuthenticated, isCheckingInProgress, lastCheckTime, state.isLoading]);

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
