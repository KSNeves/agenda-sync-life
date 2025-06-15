
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Clock, Crown } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';

export default function TrialBanner() {
  const { planType, trialEndDate, subscribed, createCheckout } = useSubscription();

  // Don't show banner for premium users
  if (subscribed && planType === 'premium') {
    return null;
  }

  // Calculate days remaining for trial users
  const getDaysRemaining = () => {
    if (!trialEndDate) return 0;
    const today = new Date();
    const endDate = new Date(trialEndDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const daysRemaining = getDaysRemaining();
  const isTrialExpired = planType === 'free' || daysRemaining <= 0;

  const handleUpgrade = async () => {
    try {
      await createCheckout('price_1RaE4jF5hbq3sDLKCtBPcScq'); // Monthly plan
    } catch (error) {
      console.error('Error upgrading:', error);
    }
  };

  return (
    <Alert className={`border-2 ${isTrialExpired ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isTrialExpired ? (
            <Crown className="h-4 w-4 text-red-600" />
          ) : (
            <Clock className="h-4 w-4 text-amber-600" />
          )}
          <AlertDescription className={isTrialExpired ? 'text-red-800' : 'text-amber-800'}>
            {isTrialExpired 
              ? 'Seu período de teste expirou. Faça upgrade para continuar usando todos os recursos.'
              : `Restam ${daysRemaining} dias no seu período de teste gratuito.`
            }
          </AlertDescription>
        </div>
        <Button 
          onClick={handleUpgrade}
          size="sm"
          className={isTrialExpired ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'}
        >
          Fazer Upgrade
        </Button>
      </div>
    </Alert>
  );
}
