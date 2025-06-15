
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Crown, Calendar } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

interface SubscriptionBlockerProps {
  onUpgrade: () => void;
}

export default function SubscriptionBlocker({ onUpgrade }: SubscriptionBlockerProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t('subscription.trialExpired.title') || 'Período gratuito expirado'}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {t('subscription.trialExpired.description') || 'Seu período de teste de 7 dias chegou ao fim. Atualize para premium para continuar usando todas as funcionalidades.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-blue-900 dark:text-blue-100">
                {t('subscription.premium.title') || 'Premium'}
              </span>
            </div>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• {t('subscription.premium.feature1') || 'Acesso ilimitado a todas as funcionalidades'}</li>
              <li>• {t('subscription.premium.feature2') || 'Sincronização em nuvem'}</li>
              <li>• {t('subscription.premium.feature3') || 'Suporte prioritário'}</li>
              <li>• {t('subscription.premium.feature4') || 'Recursos avançados de estudos'}</li>
            </ul>
          </div>
          
          <Button 
            onClick={onUpgrade}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            size="lg"
          >
            <Crown className="w-4 h-4 mr-2" />
            {t('subscription.upgradeButton') || 'Atualizar para Premium'}
          </Button>
          
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t('subscription.securePayment') || 'Pagamento seguro via Stripe'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
