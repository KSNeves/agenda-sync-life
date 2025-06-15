
import React, { createContext, useContext, ReactNode } from 'react';
import { Flashcard, Deck } from '../types/flashcard.types';
import { useSupabaseFlashcards } from './SupabaseFlashcardsContext';

interface FlashcardsContextType {
  decks: Deck[];
  flashcards: Flashcard[];
  isLoaded: boolean;
  createDeck: (deckData: { name: string; description?: string }) => Promise<string | null>;
  deleteDeck: (deckId: string) => Promise<void>;
  deleteAllDecks: () => Promise<void>;
  getDeck: (deckId: string) => Deck | undefined;
  addCard: (deckId: string, cardData: { front: string; back: string }) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  getCardsFromDeck: (deckId: string) => Flashcard[];
  reviewCard: (cardId: string, response: 'again' | 'hard' | 'good' | 'easy') => Promise<void>;
  getDueCards: (deckId: string) => Flashcard[];
  restartStudies: (deckId: string) => Promise<void>;
  getDecksStats: () => { totalDecks: number; totalCards: number; cardsToReview: number };
}

const FlashcardsContext = createContext<FlashcardsContextType | undefined>(undefined);

export function FlashcardsProvider({ children }: { children: ReactNode }) {
  const supabaseFlashcards = useSupabaseFlashcards();

  const deleteAllDecks = async () => {
    for (const deck of supabaseFlashcards.decks) {
      await supabaseFlashcards.deleteDeck(deck.id);
    }
  };

  const restartStudies = async (deckId: string) => {
    const cards = supabaseFlashcards.getCardsFromDeck(deckId);
    for (const card of cards) {
      await supabaseFlashcards.reviewCard(card.id, 'again');
    }
  };

  const getDecksStats = () => {
    const totalDecks = supabaseFlashcards.decks.length;
    const totalCards = supabaseFlashcards.flashcards.length;
    const now = Date.now();
    const cardsToReview = supabaseFlashcards.flashcards.filter(card => 
      card.nextReview <= now && (card.status === 'learning' || card.status === 'reviewing')
    ).length;

    return { totalDecks, totalCards, cardsToReview };
  };

  return (
    <FlashcardsContext.Provider value={{
      decks: supabaseFlashcards.decks,
      flashcards: supabaseFlashcards.flashcards,
      isLoaded: !supabaseFlashcards.loading,
      createDeck: supabaseFlashcards.createDeck,
      deleteDeck: supabaseFlashcards.deleteDeck,
      deleteAllDecks,
      getDeck: supabaseFlashcards.getDeck,
      addCard: supabaseFlashcards.addCard,
      deleteCard: supabaseFlashcards.deleteCard,
      getCardsFromDeck: supabaseFlashcards.getCardsFromDeck,
      reviewCard: supabaseFlashcards.reviewCard,
      getDueCards: supabaseFlashcards.getDueCards,
      restartStudies,
      getDecksStats,
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
