
import React from 'react';
import { Crown, CreditCard } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useSubscription } from '../context/SubscriptionContext';
import { useToast } from './ui/use-toast';

interface UpgradeModalProps {
  isOpen: boolean;
}

export default function UpgradeModal({ isOpen }: UpgradeModalProps) {
  const { createCheckout } = useSubscription();
  const { toast } = useToast();

  const handleUpgrade = async (priceId: string) => {
    try {
      await createCheckout(priceId);
    } catch (error) {
      console.error('Error upgrading:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar upgrade. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} modal>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        hideCloseButton
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Crown className="h-6 w-6 text-yellow-500" />
            Seu período de teste expirou
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">
              Para continuar usando todos os recursos, escolha um plano abaixo:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="relative">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-2">Mensal</h3>
                <p className="text-3xl font-bold mb-2">R$ 19,90</p>
                <p className="text-sm text-muted-foreground mb-4">por mês</p>
                <Button 
                  className="w-full" 
                  onClick={() => handleUpgrade('price_1RaE4jF5hbq3sDLKCtBPcScq')}
                >
                  Assinar Plano Mensal
                </Button>
              </CardContent>
            </Card>

            <Card className="relative border-primary border-2">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">Mais Popular</Badge>
              </div>
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-2">Anual</h3>
                <p className="text-3xl font-bold mb-2">R$ 199,90</p>
                <p className="text-sm text-muted-foreground mb-2">por ano</p>
                <p className="text-xs text-green-600 font-medium mb-4">
                  Economize R$ 38,90!
                </p>
                <Button 
                  className="w-full" 
                  onClick={() => handleUpgrade('price_1RaE5CF5hbq3sDLKhAp6negB')}
                >
                  Assinar Plano Anual
                </Button>
              </CardContent>
            </Card>

            <Card className="relative">
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-2">Vitalício</h3>
                <p className="text-3xl font-bold mb-2">R$ 499,90</p>
                <p className="text-sm text-muted-foreground mb-2">pagamento único</p>
                <p className="text-xs text-green-600 font-medium mb-4">
                  Melhor custo-benefício!
                </p>
                <Button 
                  className="w-full" 
                  onClick={() => handleUpgrade('price_1RaE66F5hbq3sDLK5l5uKNFv')}
                >
                  Comprar Vitalício
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">O que você ganha com a assinatura:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Criação ilimitada de revisões e flashcards</li>
              <li>• Agenda completa de estudos</li>
              <li>• Sistema de repetição espaçada</li>
              <li>• Suporte prioritário</li>
              <li>• Todas as funcionalidades premium</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
