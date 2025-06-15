
import React, { createContext, useContext, ReactNode } from 'react';
import { SupabaseFlashcardsProvider, useSupabaseFlashcards } from './SupabaseFlashcardsContext';
import { Flashcard, Deck } from '../types/flashcard.types';

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

function FlashcardsProviderInner({ children }: { children: ReactNode }) {
  const supabaseContext = useSupabaseFlashcards();
  
  return (
    <FlashcardsContext.Provider value={supabaseContext}>
      {children}
    </FlashcardsContext.Provider>
  );
}

export function FlashcardsProvider({ children }: { children: ReactNode }) {
  return (
    <SupabaseFlashcardsProvider>
      <FlashcardsProviderInner>
        {children}
      </FlashcardsProviderInner>
    </SupabaseFlashcardsProvider>
  );
}

export function useFlashcards() {
  const context = useContext(FlashcardsContext);
  if (context === undefined) {
    throw new Error('useFlashcards must be used within a FlashcardsProvider');
  }
  return context;
}
