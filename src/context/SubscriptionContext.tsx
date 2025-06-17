
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
    isLoading: true,
  });

  const { user, isAuthenticated } = useAuth();
  const [hasChecked, setHasChecked] = useState(false);

  const log = (message: string) => {
    console.log(`[SUBSCRIPTION] ${message}`);
  };

  // Limpar parâmetros da URL de checkout no início
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('success') || urlParams.has('canceled')) {
      const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      log('Parâmetros de checkout removidos da URL');
    }
  }, []);

  const checkSubscription = useCallback(async () => {
    if (!isAuthenticated || !user || hasChecked) {
      return;
    }

    try {
      log('Iniciando verificação de assinatura');
      setState(prev => ({ ...prev, isLoading: true }));

      // Buscar informações de trial do Supabase
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
          log('Usuário em período de trial');
        } else {
          planType = 'free';
          log('Trial expirado, plano gratuito');
        }
      } else {
        // Criar novo período de trial
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
        
        log('Novo trial criado');
      }

      // Verificar assinatura Stripe com timeout reduzido
      let isSubscribed = false;
      let subscriptionEnd = null;
      let finalPlanType: 'free_trial' | 'free' | 'premium' = planType;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 segundos

        const { data: stripeData } = await supabase.functions.invoke('check-subscription', {
          headers: { 'Content-Type': 'application/json' },
        });
        
        clearTimeout(timeoutId);
        
        if (stripeData?.subscribed) {
          isSubscribed = true;
          finalPlanType = 'premium';
          subscriptionEnd = stripeData.subscription_end;
          log('Assinatura ativa encontrada');
        }
      } catch (error) {
        log('Verificação Stripe falhou, usando dados locais');
      }

      setState({
        subscribed: isSubscribed,
        planType: finalPlanType,
        subscriptionEnd,
        trialEndDate,
        isLoading: false,
      });

      setHasChecked(true);
      log('Verificação de assinatura concluída');

    } catch (error: any) {
      log(`Erro na verificação: ${error.message}`);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [isAuthenticated, user?.id, hasChecked]);

  const createCheckout = async (priceId: string) => {
    if (!priceId || typeof priceId !== 'string') {
      throw new Error('ID do preço inválido');
    }

    try {
      log('Criando checkout para: ' + priceId);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId }
      });

      if (error) throw error;

      if (data?.url) {
        log('Abrindo checkout em nova aba');
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Erro ao criar checkout:', error);
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
      console.error('Erro ao abrir portal do cliente:', error);
      throw error;
    }
  };

  // Verificar assinatura quando usuário estiver autenticado
  useEffect(() => {
    if (isAuthenticated && user && !hasChecked) {
      // Pequeno delay para evitar condições de corrida
      const timer = setTimeout(() => {
        checkSubscription();
      }, 500);
      
      return () => clearTimeout(timer);
    } else if (!isAuthenticated) {
      // Resetar estado quando usuário sair
      setState({
        subscribed: false,
        planType: 'free_trial',
        subscriptionEnd: null,
        trialEndDate: null,
        isLoading: false,
      });
      setHasChecked(false);
      log('Estado resetado - usuário não autenticado');
    }
  }, [isAuthenticated, user?.id, hasChecked, checkSubscription]);

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
