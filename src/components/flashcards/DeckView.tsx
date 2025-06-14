
import React, { useState } from 'react';
import { ArrowLeft, Plus, Play, Edit, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useFlashcards } from '../../hooks/useFlashcards';
import { useTranslation } from '../../hooks/useTranslation';

interface DeckViewProps {
  deckId: string;
  onBack: () => void;
  onStudy: () => void;
}

export default function DeckView({ deckId, onBack, onStudy }: DeckViewProps) {
  const { getDeck, getCardsFromDeck, addCard, deleteCard, restartStudies, getDueCards } = useFlashcards();
  const { t } = useTranslation();
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  const deck = getDeck(deckId);
  const cards = getCardsFromDeck(deckId);
  const dueCards = getDueCards(deckId);

  if (!deck) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-destructive">{t('flashcards.deckNotFound')}</p>
          <Button onClick={onBack} className="mt-4">
            {t('common.back')}
          </Button>
        </div>
      </div>
    );
  }

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (front.trim() && back.trim()) {
      addCard(deckId, {
        front: front.trim(),
        back: back.trim(),
      });
      setFront('');
      setBack('');
    }
  };

  const handleDeleteCard = (cardId: string) => {
    deleteCard(cardId);
  };

  const handleRestartStudies = () => {
    if (confirm(t('flashcards.confirmRestartStudies'))) {
      restartStudies(deckId);
    }
  };

  // Categorizar cards por status - ajustado para incluir cards revisados na coluna "Revisando"
  const learning = cards.filter(card => card.status === 'learning' && card.reviewCount === 0);
  const reviewing = cards.filter(card => 
    card.reviewCount >= 1 && (card.status === 'learning' || card.status === 'reviewing')
  );
  const learned = cards.filter(card => card.status === 'learned');

  const CardColumn = ({ title, cards, color }: { title: string; cards: any[]; color: string }) => (
    <div className="flex-1">
      <div className={`rounded-t-lg p-4 ${color}`}>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="text-white/80 text-sm">{cards.length} {t('flashcards.cards')}</p>
      </div>
      <div className="border border-t-0 rounded-b-lg p-4 bg-card min-h-[300px]">
        <div className="space-y-3">
          {cards.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {t('flashcards.noCardsInCategory')}
            </p>
          ) : (
            cards.map(card => (
              <Card key={card.id} className="border-l-4 border-l-primary">
                <CardContent className="p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm mb-1">{card.front}</p>
                      <p className="text-muted-foreground text-xs">{card.back}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-destructive hover:text-destructive/80"
                        onClick={() => handleDeleteCard(card.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {t('flashcards.reviews')}: {card.reviewCount} | {t('flashcards.ease')}: {card.easeFactor.toFixed(1)} | {t('flashcards.interval')}: {card.interval}d
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{deck.name}</h1>
            {deck.description && (
              <p className="text-muted-foreground mt-1">{deck.description}</p>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              {dueCards.length} {t('flashcards.cardsToReview')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={onStudy} 
              className="bg-primary hover:bg-primary/90"
              disabled={dueCards.length === 0}
            >
              <Play className="w-4 h-4 mr-2" />
              {t('flashcards.study')} ({dueCards.length})
            </Button>
            <Button 
              onClick={handleRestartStudies}
              variant="outline"
              className="text-orange-600 border-orange-600 hover:bg-orange-50"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('flashcards.restartStudies')}
            </Button>
          </div>
        </div>

        {/* Add Card Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('flashcards.addNewCard')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('flashcards.frontCard')}
                </label>
                <Textarea
                  value={front}
                  onChange={(e) => setFront(e.target.value)}
                  placeholder={t('flashcards.frontCardPlaceholder')}
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('flashcards.backCard')}
                </label>
                <Textarea
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  placeholder={t('flashcards.backCardPlaceholder')}
                  rows={3}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                {t('flashcards.addCard')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Cards Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardColumn 
            title={t('flashcards.learning')} 
            cards={learning} 
            color="bg-red-500"
          />
          <CardColumn 
            title={t('flashcards.reviewing')} 
            cards={reviewing} 
            color="bg-yellow-500"
          />
          <CardColumn 
            title={t('flashcards.learned')} 
            cards={learned} 
            color="bg-green-500"
          />
        </div>
      </div>
    </div>
  );
}
