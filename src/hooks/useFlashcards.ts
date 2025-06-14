
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
        let newEaseFactor = card.easeFactor;
        let newInterval = card.interval;

        // Simple spaced repetition algorithm
        switch (difficulty) {
          case 'easy':
            newEaseFactor = Math.max(1.3, newEaseFactor + 0.15);
            newInterval = Math.ceil(newInterval * newEaseFactor);
            break;
          case 'medium':
            newInterval = Math.ceil(newInterval * newEaseFactor);
            break;
          case 'hard':
            newEaseFactor = Math.max(1.3, newEaseFactor - 0.2);
            newInterval = Math.max(1, Math.ceil(newInterval * 0.6));
            break;
        }

        const nextReview = Date.now() + (newInterval * 24 * 60 * 60 * 1000);

        return {
          ...card,
          difficulty,
          reviewCount: newReviewCount,
          lastReviewed: Date.now(),
          easeFactor: newEaseFactor,
          interval: newInterval,
          nextReview,
        };
      }
      return card;
    }));
  };

  const updateDeckStats = (deckId: string) => {
    const deckCards = flashcards.filter(card => card.deckId === deckId);
    const cardCount = deckCards.length;
    const newCards = deckCards.filter(card => card.reviewCount === 0).length;
    const reviewCards = deckCards.filter(card => 
      card.reviewCount > 0 && card.nextReview <= Date.now()
    ).length;

    setDecks(prev => prev.map(deck => 
      deck.id === deckId 
        ? { ...deck, cardCount, newCards, reviewCards }
        : deck
    ));
  };

  const getDecksStats = () => {
    const totalDecks = decks.length;
    const totalCards = flashcards.length;
    const cardsToReview = flashcards.filter(card => 
      card.nextReview <= Date.now()
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
