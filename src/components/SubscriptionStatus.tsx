
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, Calendar, AlertTriangle } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import { useTranslation } from '../hooks/useTranslation';

export default function SubscriptionStatus() {
  const { subscription, loading, daysRemaining, isPremium, isTrialExpired } = useSubscription();
  const { t } = useTranslation();

  if (loading || !subscription) {
    return null;
  }

  if (isPremium) {
    return (
      <Badge variant="default" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <Crown className="w-3 h-3 mr-1" />
        {t('subscription.premium.badge') || 'Premium'}
      </Badge>
    );
  }

  if (isTrialExpired) {
    return (
      <Badge variant="destructive">
        <AlertTriangle className="w-3 h-3 mr-1" />
        {t('subscription.expired.badge') || 'Expirado'}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="border-orange-300 text-orange-700 dark:border-orange-600 dark:text-orange-400">
      <Calendar className="w-3 h-3 mr-1" />
      {daysRemaining > 0 
        ? `${daysRemaining} ${t('subscription.daysRemaining') || 'dias restantes'}`
        : t('subscription.lastDay') || 'Último dia'
      }
    </Badge>
  );
}
