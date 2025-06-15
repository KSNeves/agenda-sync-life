
import React from 'react';
import { Lock, Crown } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useSubscription } from '../hooks/useSubscription';

interface SubscriptionBlockProps {
  feature: string;
  onUpgrade?: () => void;
}

export default function SubscriptionBlock({ feature, onUpgrade }: SubscriptionBlockProps) {
  const { subscription, isTrialExpired, trialDaysRemaining } = useSubscription();

  const getMessage = () => {
    if (subscription?.plan_type === 'free_trial' && isTrialExpired) {
      return `Seu período de teste expirou. Assine o plano Premium para continuar usando ${feature}.`;
    }
    
    if (subscription?.plan_type === 'free') {
      return `Esta funcionalidade requer o plano Premium. Assine agora para acessar ${feature}.`;
    }
    
    return `Acesso bloqueado para ${feature}. Assine o plano Premium.`;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Funcionalidade Bloqueada
            </h2>
            <p className="text-muted-foreground">
              {getMessage()}
            </p>
          </div>

          {subscription?.plan_type === 'free_trial' && !isTrialExpired && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-800 font-medium">
                Período de teste: {trialDaysRemaining} {trialDaysRemaining === 1 ? 'dia restante' : 'dias restantes'}
              </p>
            </div>
          )}

          <Button 
            onClick={onUpgrade}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
          >
            <Crown className="w-4 h-4 mr-2" />
            Assinar Premium
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
