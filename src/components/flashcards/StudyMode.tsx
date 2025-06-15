
import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { useFlashcards } from '../../hooks/useFlashcards';
import { useTranslation } from '../../hooks/useTranslation';

interface StudyModeProps {
  deckId: string;
  onExit: () => void;
}

export default function StudyMode({ deckId, onExit }: StudyModeProps) {
  const { getDeck, getDueCards, reviewCard } = useFlashcards();
  const { t } = useTranslation();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [studiedCards, setStudiedCards] = useState(0);
  const [sessionCards, setSessionCards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const deck = getDeck(deckId);

  useEffect(() => {
    const loadCards = async () => {
      setIsLoading(true);
      try {
        const dueCards = getDueCards(deckId);
        setSessionCards(dueCards);
      } catch (error) {
        console.error('Error loading cards:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCards();
  }, [deckId, getDueCards]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-yellow-400 mb-4">
            {t('common.loading')}...
          </p>
          <Button onClick={onExit}>{t('common.back')}</Button>
        </div>
      </div>
    );
  }

  const currentCard = sessionCards[currentCardIndex];
  const hasNextCard = currentCardIndex < sessionCards.length - 1;

  const handleCardClick = () => {
    setShowBack(!showBack);
  };

  const handleResponse = (response: 'again' | 'hard' | 'good' | 'easy') => {
    if (currentCard) {
      reviewCard(currentCard.id, response);
      setStudiedCards(prev => prev + 1);

      if (hasNextCard) {
        setCurrentCardIndex(prev => prev + 1);
        setShowBack(false);
      } else {
        // Fim da sessão
        alert(`${t('flashcards.studyComplete')} ${t('flashcards.studiedCards')}: ${studiedCards + 1}`);
        onExit();
      }
    }
  };

  const handleRestart = () => {
    const dueCards = getDueCards(deckId);
    setSessionCards(dueCards);
    setCurrentCardIndex(0);
    setShowBack(false);
    setStudiedCards(0);
  };

  if (!deck || sessionCards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-yellow-400 mb-4">
            {!deck ? t('flashcards.deckNotFound') : t('flashcards.noCardsToReview')}
          </p>
          <Button onClick={onExit}>{t('common.back')}</Button>
        </div>
      </div>
    );
  }

  // Add safety check for currentCard
  if (!currentCard) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-yellow-400 mb-4">
            {t('common.loading')}...
          </p>
          <Button onClick={onExit}>{t('common.back')}</Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    if (!status) return 'text-gray-400';
    switch (status) {
      case 'learning': return 'text-red-400';
      case 'reviewing': return 'text-yellow-400';
      case 'learned': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    if (!status) return t('flashcards.unknown');
    switch (status) {
      case 'learning': return t('flashcards.learning');
      case 'reviewing': return t('flashcards.reviewing');
      case 'learned': return t('flashcards.learned');
      default: return t('flashcards.unknown');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onExit}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('flashcards.exit')}
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{deck.name}</h1>
              <p className="text-gray-400">
                {currentCardIndex + 1} {t('flashcards.of')} {sessionCards.length} {t('flashcards.cards')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              {t('flashcards.studied')}: {studiedCards}
            </div>
            <Button variant="outline" onClick={handleRestart}>
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('flashcards.restart')}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-800 rounded-full h-2 mb-8">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentCardIndex) / sessionCards.length) * 100}%` }}
          />
        </div>

        {/* Card Info */}
        <div className="mb-4 text-center">
          <span className={`text-sm font-medium ${getStatusColor(currentCard.status)}`}>
            {getStatusText(currentCard.status)} • 
            {t('flashcards.reviews')}: {currentCard.reviewCount || 0} • 
            {t('flashcards.ease')}: {(currentCard.easeFactor || 2.5).toFixed(1)}
          </span>
        </div>

        {/* Card Display */}
        <div className="flex justify-center">
          <Card 
            className="w-full max-w-2xl bg-gray-800 border-gray-700 cursor-pointer min-h-[400px]"
            onClick={handleCardClick}
          >
            <CardContent className="p-8 flex flex-col justify-center items-center text-center h-full min-h-[400px]">
              {!showBack ? (
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    {currentCard.front}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {t('flashcards.clickToReveal')}
                  </p>
                </div>
              ) : (
                <div className="w-full">
                  <div className="mb-6">
                    <p className="text-xl text-white mb-6">{currentCard.back}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-gray-300 mb-4">{t('flashcards.howWasAnswer')}</p>
                    <div className="flex gap-2 justify-center flex-wrap">
                      <Button
                        onClick={() => handleResponse('again')}
                        className="bg-red-600 hover:bg-red-700 text-white min-w-20"
                      >
                        {t('flashcards.forgot')}
                      </Button>
                      <Button
                        onClick={() => handleResponse('hard')}
                        className="bg-orange-500 hover:bg-orange-600 text-white min-w-20"
                      >
                        {t('flashcards.hard')}
                      </Button>
                      <Button
                        onClick={() => handleResponse('good')}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white min-w-20"
                      >
                        {t('flashcards.good')}
                      </Button>
                      <Button
                        onClick={() => handleResponse('easy')}
                        className="bg-green-500 hover:bg-green-600 text-white min-w-20"
                      >
                        {t('flashcards.easy')}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
