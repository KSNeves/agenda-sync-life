
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
      status: 'unlearned',
      easyCount: 0,
      mediumCount: 0,
      hardCount: 0,
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
        const newReviewCount = card.reviewCount + 1;
        let newStatus = card.status;
        let newEasyCount = card.easyCount;
        let newMediumCount = card.mediumCount;
        let newHardCount = card.hardCount;

        // Lógica de revisão do Anki
        if (difficulty === 'easy') {
          newEasyCount += 1;
          if (card.status === 'unlearned') {
            newStatus = 'reviewing';
          } else if (card.status === 'reviewing' && newEasyCount >= 2) {
            newStatus = 'learned';
          }
        } else if (difficulty === 'medium') {
          newMediumCount += 1;
          if (card.status === 'unlearned') {
            newStatus = 'reviewing';
          }
          // Se estava em reviewing e clicou medium, continua em reviewing
          // Se clicou easy depois de medium, vai para lógica de easy
        } else if (difficulty === 'hard') {
          newHardCount += 1;
          if (card.status === 'unlearned') {
            newStatus = 'reviewing';
          }
          // Se estava em reviewing e clicou hard, continua em reviewing
          // Se clicou medium ou easy depois de hard, vai para respectiva lógica
        }

        return {
          ...card,
          difficulty,
          reviewCount: newReviewCount,
          lastReviewed: Date.now(),
          status: newStatus,
          easyCount: newEasyCount,
          mediumCount: newMediumCount,
          hardCount: newHardCount,
        };
      }
      return card;
    }));
  };

  const restartStudies = (deckId: string) => {
    setFlashcards(prev => prev.map(card => {
      if (card.deckId === deckId) {
        return {
          ...card,
          status: 'unlearned' as const,
          reviewCount: 0,
          easyCount: 0,
          mediumCount: 0,
          hardCount: 0,
          lastReviewed: undefined,
        };
      }
      return card;
    }));
    updateDeckStats(deckId);
  };

  const updateDeckStats = (deckId: string) => {
    setTimeout(() => {
      const deckCards = flashcards.filter(card => card.deckId === deckId);
      const cardCount = deckCards.length;
      const newCards = deckCards.filter(card => card.status === 'unlearned').length;
      const reviewCards = deckCards.filter(card => card.status === 'reviewing').length;

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
      card.status === 'reviewing'
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
    restartStudies,
    getDecksStats,
  };
}
