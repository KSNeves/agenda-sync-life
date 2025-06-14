
import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { useFlashcards } from '../../hooks/useFlashcards';

interface StudyModeProps {
  deckId: string;
  onExit: () => void;
}

export default function StudyMode({ deckId, onExit }: StudyModeProps) {
  const { getDeck, getCardsFromDeck, reviewCard } = useFlashcards();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [studiedCards, setStudiedCards] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const deck = getDeck(deckId);
  const cards = getCardsFromDeck(deckId);

  const currentCard = cards[currentCardIndex];
  const hasNextCard = currentCardIndex < cards.length - 1;

  const handleCardClick = () => {
    if (!showBack) {
      setShowBack(true);
    }
  };

  const handleDifficultySelect = (difficulty: 'easy' | 'medium' | 'hard') => {
    if (currentCard) {
      reviewCard(currentCard.id, difficulty);
      setStudiedCards(prev => prev + 1);
      
      if (difficulty === 'easy') {
        setCorrectAnswers(prev => prev + 1);
      }

      if (hasNextCard) {
        setCurrentCardIndex(prev => prev + 1);
        setShowBack(false);
      } else {
        // Fim da sessão
        alert(`Sessão concluída! Você estudou ${studiedCards + 1} cards.`);
        onExit();
      }
    }
  };

  const handleRestart = () => {
    setCurrentCardIndex(0);
    setShowBack(false);
    setStudiedCards(0);
    setCorrectAnswers(0);
  };

  if (!deck || cards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-red-400 mb-4">
            {!deck ? 'Deck não encontrado' : 'Nenhum card para estudar'}
          </p>
          <Button onClick={onExit}>Voltar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onExit}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Sair
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{deck.name}</h1>
              <p className="text-gray-400">
                {currentCardIndex + 1} de {cards.length} cards
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {studiedCards > 0 && (
              <div className="text-sm text-gray-400">
                Estudados: {studiedCards} | Acertos: {correctAnswers}
              </div>
            )}
            <Button variant="outline" onClick={handleRestart}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reiniciar
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-800 rounded-full h-2 mb-8">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentCardIndex) / cards.length) * 100}%` }}
          />
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
                    Clique para ver a resposta
                  </p>
                </div>
              ) : (
                <div className="w-full">
                  <div className="mb-6">
                    <h3 className="text-lg text-gray-400 mb-2">Pergunta:</h3>
                    <p className="text-xl text-white mb-4">{currentCard.front}</p>
                    
                    <h3 className="text-lg text-gray-400 mb-2">Resposta:</h3>
                    <p className="text-xl text-white mb-6">{currentCard.back}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-gray-300 mb-4">Como foi sua resposta?</p>
                    <div className="flex gap-3 justify-center">
                      <Button
                        onClick={() => handleDifficultySelect('hard')}
                        className="bg-red-600 hover:bg-red-700 flex-1 max-w-32"
                      >
                        Difícil
                      </Button>
                      <Button
                        onClick={() => handleDifficultySelect('medium')}
                        className="bg-yellow-600 hover:bg-yellow-700 flex-1 max-w-32"
                      >
                        Médio
                      </Button>
                      <Button
                        onClick={() => handleDifficultySelect('easy')}
                        className="bg-green-600 hover:bg-green-700 flex-1 max-w-32"
                      >
                        Fácil
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
