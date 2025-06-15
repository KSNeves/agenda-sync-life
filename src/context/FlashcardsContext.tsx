import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Flashcard, Deck } from '../types/flashcard.types';
import { calculateNextReview } from '../utils/ankiAlgorithm';

interface FlashcardsContextType {
  decks: Deck[];
  flashcards: Flashcard[];
  isLoaded: boolean;
  createDeck: (deckData: { name: string; description?: string }) => string;
  deleteDeck: (deckId: string) => void;
  deleteAllDecks: () => void;
  getDeck: (deckId: string) => Deck | undefined;
  addCard: (deckId: string, cardData: { front: string; back: string }) => void;
  deleteCard: (cardId: string) => void;
  getCardsFromDeck: (deckId: string) => Flashcard[];
  reviewCard: (cardId: string, response: 'again' | 'hard' | 'good' | 'easy') => void;
  getDueCards: (deckId: string) => Flashcard[];
  restartStudies: (deckId: string) => void;
  getDecksStats: () => { totalDecks: number; totalCards: number; cardsToReview: number };
}

const FlashcardsContext = createContext<FlashcardsContextType | undefined>(undefined);

export function FlashcardsProvider({ children }: { children: ReactNode }) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    console.log('🔄 Loading data from localStorage...');
    const savedDecks = localStorage.getItem('flashcard-decks');
    const savedCards = localStorage.getItem('flashcard-cards');
    
    try {
      if (savedDecks) {
        const parsedDecks = JSON.parse(savedDecks);
        console.log('📚 Loaded decks from localStorage:', parsedDecks);
        setDecks(parsedDecks);
      } else {
        console.log('📚 No decks found in localStorage');
        setDecks([]);
      }
      
      if (savedCards) {
        const parsedCards = JSON.parse(savedCards);
        console.log('🃏 Loaded cards from localStorage:', parsedCards);
        setFlashcards(parsedCards);
      } else {
        console.log('🃏 No cards found in localStorage');
        setFlashcards([]);
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      setDecks([]);
      setFlashcards([]);
    }
    
    setIsLoaded(true);
  }, []);

  // Save decks to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      console.log('💾 Saving decks to localStorage:', decks);
      localStorage.setItem('flashcard-decks', JSON.stringify(decks));
    }
  }, [decks, isLoaded]);

  // Save cards to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      console.log('💾 Saving cards to localStorage:', flashcards);
      localStorage.setItem('flashcard-cards', JSON.stringify(flashcards));
    }
  }, [flashcards, isLoaded]);

  const createDeck = (deckData: { name: string; description?: string }) => {
    console.log('🆕 Creating new deck:', deckData);
    
    const newDeck: Deck = {
      id: Date.now().toString(),
      name: deckData.name,
      description: deckData.description,
      createdAt: Date.now(),
      cardCount: 0,
      newCards: 0,
      reviewCards: 0,
      learnedCards: 0,
    };

    console.log('🆕 New deck object:', newDeck);

    setDecks(prevDecks => {
      const updatedDecks = [...prevDecks, newDeck];
      console.log('📚 Updated decks array:', updatedDecks);
      return updatedDecks;
    });
    
    return newDeck.id;
  };

  const deleteDeck = (deckId: string) => {
    setDecks(prev => prev.filter(deck => deck.id !== deckId));
    setFlashcards(prev => prev.filter(card => card.deckId !== deckId));
  };

  const deleteAllDecks = () => {
    console.log('🗑️ Deleting all decks and flashcards...');
    setDecks([]);
    setFlashcards([]);
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
      status: 'learning',
      lapses: 0,
      learningStep: 0,
    };

    setFlashcards(prev => {
      const updated = [...prev, newCard];
      updateDeckStatsWithCards(deckId, updated);
      return updated;
    });
  };

  const deleteCard = (cardId: string) => {
    setFlashcards(prev => {
      const card = prev.find(c => c.id === cardId);
      const updated = prev.filter(c => c.id !== cardId);
      if (card) {
        updateDeckStatsWithCards(card.deckId, updated);
      }
      return updated;
    });
  };

  const getCardsFromDeck = (deckId: string) => {
    return flashcards.filter(card => card.deckId === deckId);
  };

  const reviewCard = (cardId: string, response: 'again' | 'hard' | 'good' | 'easy') => {
    setFlashcards(prev => {
      const updated = prev.map(card => {
        if (card.id === cardId) {
          const ankiUpdates = calculateNextReview(card, response);
          
          return {
            ...card,
            ...ankiUpdates,
            lastReviewed: Date.now(),
          };
        }
        return card;
      });

      const reviewedCard = updated.find(c => c.id === cardId);
      if (reviewedCard) {
        updateDeckStatsWithCards(reviewedCard.deckId, updated);
      }
      
      return updated;
    });
  };

  const getDueCards = (deckId: string) => {
    const deckCards = getCardsFromDeck(deckId);
    const now = Date.now();
    return deckCards.filter(card => card.nextReview <= now);
  };

  const restartStudies = (deckId: string) => {
    setFlashcards(prev => {
      const updated = prev.map(card => {
        if (card.deckId === deckId) {
          return {
            ...card,
            status: 'learning' as const,
            reviewCount: 0,
            lapses: 0,
            learningStep: 0,
            easeFactor: 2.5,
            interval: 1,
            nextReview: Date.now(),
            lastReviewed: undefined,
          };
        }
        return card;
      });
      
      updateDeckStatsWithCards(deckId, updated);
      return updated;
    });
  };

  const updateDeckStatsWithCards = (deckId: string, cards: Flashcard[]) => {
    const deckCards = cards.filter(card => card.deckId === deckId);
    const cardCount = deckCards.length;
    const newCards = deckCards.filter(card => card.status === 'learning' && card.reviewCount === 0).length;
    const reviewCards = deckCards.filter(card => card.status === 'learning' || card.status === 'reviewing').length;
    const learnedCards = deckCards.filter(card => card.status === 'learned').length;

    setDecks(prev => prev.map(deck => 
      deck.id === deckId 
        ? { ...deck, cardCount, newCards, reviewCards, learnedCards }
        : deck
    ));
  };

  const getDecksStats = () => {
    const totalDecks = decks.length;
    const totalCards = flashcards.length;
    const now = Date.now();
    const cardsToReview = flashcards.filter(card => 
      card.nextReview <= now && (card.status === 'learning' || card.status === 'reviewing')
    ).length;

    return { totalDecks, totalCards, cardsToReview };
  };

  return (
    <FlashcardsContext.Provider value={{
      decks,
      flashcards,
      createDeck,
      deleteDeck,
      deleteAllDecks,
      getDeck,
      addCard,
      deleteCard,
      getCardsFromDeck,
      reviewCard,
      getDueCards,
      restartStudies,
      getDecksStats,
      isLoaded,
    }}>
      {children}
    </FlashcardsContext.Provider>
  );
}

export function useFlashcards() {
  const context = useContext(FlashcardsContext);
  if (context === undefined) {
    throw new Error('useFlashcards must be used within a FlashcardsProvider');
  }
  return context;
}
