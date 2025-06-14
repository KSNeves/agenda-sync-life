
import { useState, useEffect } from 'react';
import { Flashcard, Deck } from '../types/flashcard.types';

export function useFlashcards() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedDecks = localStorage.getItem('flashcard-decks');
    const savedCards = localStorage.getItem('flashcard-cards');
    
    if (savedDecks) {
      setDecks(JSON.parse(savedDecks));
    }
    
    if (savedCards) {
      setFlashcards(JSON.parse(savedCards));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('flashcard-decks', JSON.stringify(decks));
  }, [decks]);

  useEffect(() => {
    localStorage.setItem('flashcard-cards', JSON.stringify(flashcards));
  }, [flashcards]);

  const createDeck = (deckData: { name: string; description?: string }) => {
    const newDeck: Deck = {
      id: Date.now().toString(),
      name: deckData.name,
      description: deckData.description,
      createdAt: Date.now(),
      cardCount: 0,
      newCards: 0,
      reviewCards: 0,
    };

    setDecks(prev => [...prev, newDeck]);
    return newDeck.id;
  };

  const deleteDeck = (deckId: string) => {
    setDecks(prev => prev.filter(deck => deck.id !== deckId));
    setFlashcards(prev => prev.filter(card => card.deckId !== deckId));
  };

  const getDeck = (deckId: string) => {
    return decks.find(deck => deck.id === deckId);
  };

  const addCard = (deckId: string, cardData: { front: string; back: string }) => {
    const newCard: Flashcard = {
      id: Date.now().toString(),
      front: cardData.front,
      back: cardData.back,
      deckId,
      createdAt: Date.now(),
      reviewCount: 0,
      easeFactor: 2.5,
      interval: 1,
      nextReview: Date.now(),
      status: 'unlearned', // Novos cards começam como não aprendidos
      targetReviews: 0,
      currentStreak: 0,
    };

    setFlashcards(prev => [...prev, newCard]);
    updateDeckStats(deckId);
  };

  const deleteCard = (cardId: string) => {
    const card = flashcards.find(c => c.id === cardId);
    setFlashcards(prev => prev.filter(c => c.id !== cardId));
    if (card) {
      updateDeckStats(card.deckId);
    }
  };

  const getCardsFromDeck = (deckId: string) => {
    return flashcards.filter(card => card.deckId === deckId);
  };

  const reviewCard = (cardId: string, difficulty: 'easy' | 'medium' | 'hard') => {
    setFlashcards(prev => prev.map(card => {
      if (card.id === cardId) {
        let newStatus = card.status;
        let newTargetReviews = card.targetReviews;
        let newCurrentStreak = card.currentStreak;
        let nextReviewDate = Date.now();

        // Se o card é novo (unlearned), definir os parâmetros iniciais
        if (card.status === 'unlearned') {
          newStatus = 'reviewing';
          newCurrentStreak = 1;
          
          // Definir target de revisões baseado na dificuldade
          switch (difficulty) {
            case 'easy':
              newTargetReviews = 2;
              break;
            case 'medium':
              newTargetReviews = 4;
              break;
            case 'hard':
              newTargetReviews = 7;
              break;
          }
          
          // Próxima revisão para o dia seguinte
          nextReviewDate = Date.now() + (24 * 60 * 60 * 1000);
        } 
        // Se o card está em revisão
        else if (card.status === 'reviewing') {
          // Se mudou a dificuldade, ajustar o target
          if (difficulty === 'easy' && card.targetReviews !== 2) {
            newTargetReviews = 2;
            newCurrentStreak = 1;
          } else if (difficulty === 'medium' && card.targetReviews !== 4) {
            newTargetReviews = 4;
            newCurrentStreak = 1;
          } else if (difficulty === 'hard' && card.targetReviews !== 7) {
            newTargetReviews = 7;
            newCurrentStreak = 1;
          } else {
            // Manteve a mesma dificuldade, incrementar streak
            newCurrentStreak = card.currentStreak + 1;
          }

          // Verificar se completou o número necessário de revisões
          if (newCurrentStreak >= newTargetReviews) {
            newStatus = 'learned';
            nextReviewDate = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 dias no futuro
          } else {
            // Ainda em revisão, próxima revisão para o dia seguinte
            nextReviewDate = Date.now() + (24 * 60 * 60 * 1000);
          }
        }
        // Se já estava aprendido, manter como aprendido
        else if (card.status === 'learned') {
          // Se revisar um card já aprendido, pode voltar para revisão se não for fácil
          if (difficulty !== 'easy') {
            newStatus = 'reviewing';
            newCurrentStreak = 1;
            switch (difficulty) {
              case 'medium':
                newTargetReviews = 4;
                break;
              case 'hard':
                newTargetReviews = 7;
                break;
            }
            nextReviewDate = Date.now() + (24 * 60 * 60 * 1000);
          } else {
            // Mantém como aprendido
            nextReviewDate = Date.now() + (30 * 24 * 60 * 60 * 1000);
          }
        }

        return {
          ...card,
          difficulty,
          reviewCount: card.reviewCount + 1,
          lastReviewed: Date.now(),
          nextReview: nextReviewDate,
          status: newStatus,
          targetReviews: newTargetReviews,
          currentStreak: newCurrentStreak,
        };
      }
      return card;
    }));
  };

  const updateDeckStats = (deckId: string) => {
    setTimeout(() => {
      const deckCards = flashcards.filter(card => card.deckId === deckId);
      const cardCount = deckCards.length;
      const newCards = deckCards.filter(card => card.status === 'unlearned').length;
      const reviewCards = deckCards.filter(card => 
        card.status === 'reviewing' && card.nextReview <= Date.now()
      ).length;

      setDecks(prev => prev.map(deck => 
        deck.id === deckId 
          ? { ...deck, cardCount, newCards, reviewCards }
          : deck
      ));
    }, 100);
  };

  const getDecksStats = () => {
    const totalDecks = decks.length;
    const totalCards = flashcards.length;
    const cardsToReview = flashcards.filter(card => 
      card.nextReview <= Date.now() && card.status !== 'learned'
    ).length;

    return { totalDecks, totalCards, cardsToReview };
  };

  // Update deck stats whenever flashcards change
  useEffect(() => {
    decks.forEach(deck => updateDeckStats(deck.id));
  }, [flashcards.length]);

  return {
    decks,
    flashcards,
    createDeck,
    deleteDeck,
    getDeck,
    addCard,
    deleteCard,
    getCardsFromDeck,
    reviewCard,
    getDecksStats,
  };
}
