
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: 'free_trial' | 'free' | 'premium';
  trial_start_date: string | null;
  trial_end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 useSubscription - User state:', user);
    
    if (!user) {
      console.log('❌ No user found, setting loading to false');
      setSubscription(null);
      setLoading(false);
      return;
    }

    loadSubscription();
  }, [user]);

  const loadSubscription = async () => {
    try {
      console.log('📡 Loading subscription for user:', user?.id);
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erro ao carregar assinatura:', error);
        // Se não encontrar assinatura, criar uma
        if (error.code === 'PGRST116') {
          console.log('📝 Creating new subscription for user');
          await createSubscription();
          return;
        }
      }

      console.log('✅ Subscription loaded:', data);
      setSubscription(data);
    } catch (error) {
      console.error('❌ Erro ao carregar assinatura:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSubscription = async () => {
    if (!user) return;

    try {
      const now = new Date();
      const trialEnd = new Date();
      trialEnd.setDate(now.getDate() + 7);

      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_type: 'free_trial',
          trial_start_date: now.toISOString(),
          trial_end_date: trialEnd.toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar assinatura:', error);
        return;
      }

      console.log('✅ Subscription created:', data);
      setSubscription(data);
    } catch (error) {
      console.error('❌ Erro ao criar assinatura:', error);
    }
  };

  const isTrialExpired = () => {
    if (!subscription || subscription.plan_type !== 'free_trial') return false;
    if (!subscription.trial_end_date) return false;
    
    return new Date() > new Date(subscription.trial_end_date);
  };

  const getTrialDaysRemaining = () => {
    if (!subscription || subscription.plan_type !== 'free_trial') return 0;
    if (!subscription.trial_end_date) return 0;
    
    const endDate = new Date(subscription.trial_end_date);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  const canAccessFeatures = () => {
    console.log('🔍 Checking feature access:', { 
      subscription: subscription?.plan_type, 
      isTrialExpired: isTrialExpired() 
    });
    
    if (!subscription) return false;
    
    if (subscription.plan_type === 'premium') return true;
    if (subscription.plan_type === 'free_trial') return !isTrialExpired();
    
    return false; // free plan - blocked
  };

  const upgradeToPremium = async () => {
    if (!user || !subscription) return false;

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          plan_type: 'premium',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao atualizar plano:', error);
        return false;
      }

      await loadSubscription();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      return false;
    }
  };

  return {
    subscription,
    loading,
    isTrialExpired: isTrialExpired(),
    trialDaysRemaining: getTrialDaysRemaining(),
    canAccessFeatures: canAccessFeatures(),
    upgradeToPremium,
    refetch: loadSubscription
  };
}
