
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../context/AuthContext';

export interface Subscription {
  id: string;
  userId: string;
  planType: 'free_trial' | 'premium' | 'expired';
  trialStartDate: string | null;
  trialEndDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);

  const loadSubscription = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Erro ao carregar assinatura:', error);
        setLoading(false);
        return;
      }

      if (data) {
        const sub: Subscription = {
          id: data.id,
          userId: data.user_id,
          planType: data.plan_type,
          trialStartDate: data.trial_start_date,
          trialEndDate: data.trial_end_date,
          isActive: data.is_active,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };

        setSubscription(sub);

        // Check if trial is expired
        if (sub.planType === 'free_trial' && sub.trialEndDate) {
          const now = new Date();
          const endDate = new Date(sub.trialEndDate);
          const expired = now > endDate;
          
          setIsTrialExpired(expired);
          
          if (!expired) {
            const diffTime = endDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setDaysRemaining(Math.max(0, diffDays));
          } else {
            setDaysRemaining(0);
            // Update subscription status to expired
            await updateSubscriptionStatus('expired');
          }
        } else if (sub.planType === 'premium') {
          setIsTrialExpired(false);
          setDaysRemaining(0);
        } else {
          setIsTrialExpired(true);
          setDaysRemaining(0);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar assinatura:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSubscriptionStatus = async (newPlanType: 'free_trial' | 'premium' | 'expired') => {
    if (!user || !subscription) return;

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          plan_type: newPlanType,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao atualizar assinatura:', error);
        return;
      }

      // Reload subscription data
      await loadSubscription();
    } catch (error) {
      console.error('Erro ao atualizar assinatura:', error);
    }
  };

  const upgradeToPremium = async () => {
    await updateSubscriptionStatus('premium');
  };

  useEffect(() => {
    loadSubscription();
  }, [user]);

  // Check subscription status periodically
  useEffect(() => {
    if (!subscription || subscription.planType !== 'free_trial') return;

    const interval = setInterval(() => {
      loadSubscription();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [subscription]);

  const isPremium = subscription?.planType === 'premium';
  const isBlocked = isTrialExpired && !isPremium;

  return {
    subscription,
    loading,
    isTrialExpired,
    daysRemaining,
    isPremium,
    isBlocked,
    upgradeToPremium,
    loadSubscription
  };
}
