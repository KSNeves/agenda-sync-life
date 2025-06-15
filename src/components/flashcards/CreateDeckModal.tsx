
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useFlashcards } from '../../context/FlashcardsContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from '../../hooks/useTranslation';

interface CreateDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateDeckModal({ isOpen, onClose }: CreateDeckModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { createDeck } = useFlashcards();
  const { subscribed, planType, trialEndDate } = useSubscription();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Check if trial has expired
  const isTrialExpired = () => {
    if (subscribed && planType === 'premium') return false;
    if (planType === 'free') return true;
    if (!trialEndDate) return false;
    
    const today = new Date();
    const endDate = new Date(trialEndDate);
    return today > endDate;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isTrialExpired()) {
      toast({
        title: "Período de teste expirado",
        description: "Faça upgrade para continuar criando decks.",
        variant: "destructive"
      });
      onClose();
      return;
    }
    
    if (name.trim()) {
      console.log('🔥 Creating deck with name:', name.trim());
      
      const newDeckId = await createDeck({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      
      console.log('✅ Deck created with ID:', newDeckId);
      
      // Reset form
      setName('');
      setDescription('');
      
      // Close modal
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('flashcards.createNewDeck')}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('flashcards.deckName')}
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('flashcards.deckNamePlaceholder')}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('flashcards.deckDescription')} ({t('common.optional')})
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('flashcards.deckDescriptionPlaceholder')}
                rows={3}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {t('flashcards.createDeck')}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
