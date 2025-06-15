
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Flashcard, Deck } from '../types/flashcard.types';
import { calculateNextReview } from '../utils/ankiAlgorithm';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { generateUUID } from '../utils/uuid';
import { toast } from '@/components/ui/use-toast';

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

const SupabaseFlashcardsContext = createContext<FlashcardsContextType | undefined>(undefined);

export function SupabaseFlashcardsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load decks from Supabase
  const loadDecks = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_flashcard_decks')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const transformedDecks: Deck[] = data.map(deck => ({
        id: deck.id,
        name: deck.name,
        description: deck.description || '',
        createdAt: new Date(deck.created_at!).getTime(),
        cardCount: 0,
        newCards: 0,
        reviewCards: 0,
        learnedCards: 0,
      }));

      setDecks(transformedDecks);
    } catch (error) {
      console.error('Error loading decks:', error);
    }
  };

  // Load flashcards from Supabase
  const loadFlashcards = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_flashcards')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const transformedCards: Flashcard[] = data.map(card => ({
        id: card.id,
        front: card.front,
        back: card.back,
        deckId: card.deck_id,
        createdAt: new Date(card.created_at!).getTime(),
        reviewCount: card.repetitions || 0,
        easeFactor: card.ease_factor || 2.5,
        interval: card.interval_days || 1,
        nextReview: card.due_date ? new Date(card.due_date).getTime() : Date.now(),
        status: 'learning' as const,
        lapses: 0,
        learningStep: 0,
      }));

      setFlashcards(transformedCards);
    } catch (error) {
      console.error('Error loading flashcards:', error);
    }
  };

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadDecks();
      loadFlashcards();
    } else {
      setDecks([]);
      setFlashcards([]);
    }
    setIsLoaded(true);
  }, [user]);

  const createDeck = (deckData: { name: string; description?: string }) => {
    if (!user) return '';

    // Generate a proper UUID
    const deckId = generateUUID();
    
    const newDeck: Deck = {
      id: deckId,
      name: deckData.name,
      description: deckData.description || '',
      createdAt: Date.now(),
      cardCount: 0,
      newCards: 0,
      reviewCards: 0,
      learnedCards: 0,
    };

    setDecks(prev => [...prev, newDeck]);

    // Save to Supabase
    supabase
      .from('user_flashcard_decks')
      .insert({
        id: deckId,
        user_id: user.id,
        name: deckData.name,
        description: deckData.description
      })
      .then(({ error }) => {
        if (error) {
          console.error('Error creating deck:', error);
          setDecks(prev => prev.filter(deck => deck.id !== deckId));
        }
      });

    return deckId;
  };

  const deleteDeck = (deckId: string) => {
    setDecks(prev => prev.filter(deck => deck.id !== deckId));
    setFlashcards(prev => prev.filter(card => card.deckId !== deckId));

    if (user) {
      supabase
        .from('user_flashcard_decks')
        .delete()
        .eq('id', deckId)
        .eq('user_id', user.id);
    }
  };

  const deleteAllDecks = () => {
    setDecks([]);
    setFlashcards([]);

    if (user) {
      supabase
        .from('user_flashcard_decks')
        .delete()
        .eq('user_id', user.id);
    }
  };

  const getDeck = (deckId: string) => {
    return decks.find(deck => deck.id === deckId);
  };

  const addCard = (deckId: string, cardData: { front: string; back: string }) => {
    if (!user) return;

    // Generate a proper UUID
    const cardId = generateUUID();
    const newCard: Flashcard = {
      id: cardId,
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

    setFlashcards(prev => [...prev, newCard]);
    updateDeckStatsWithCards(deckId, [...flashcards, newCard]);

    // Save to Supabase
    supabase
      .from('user_flashcards')
      .insert({
        id: cardId,
        user_id: user.id,
        deck_id: deckId,
        front: cardData.front,
        back: cardData.back,
        due_date: new Date().toISOString()
      })
      .then(({ error }) => {
        if (error) {
          console.error('Error creating card:', error);
          setFlashcards(prev => prev.filter(card => card.id !== cardId));
        }
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

    if (user) {
      supabase
        .from('user_flashcards')
        .delete()
        .eq('id', cardId)
        .eq('user_id', user.id);
    }
  };

  const getCardsFromDeck = (deckId: string) => {
    return flashcards.filter(card => card.deckId === deckId);
  };

  const reviewCard = (cardId: string, response: 'again' | 'hard' | 'good' | 'easy') => {
    setFlashcards(prev => {
      const updated = prev.map(card => {
        if (card.id === cardId) {
          const ankiUpdates = calculateNextReview(card, response);
          const updatedCard = {
            ...card,
            ...ankiUpdates,
            lastReviewed: Date.now(),
          };

          // Update in Supabase
          if (user) {
            supabase
              .from('user_flashcards')
              .update({
                repetitions: updatedCard.reviewCount,
                ease_factor: updatedCard.easeFactor,
                interval_days: updatedCard.interval,
                due_date: new Date(updatedCard.nextReview).toISOString()
              })
              .eq('id', cardId)
              .eq('user_id', user.id);
          }

          return updatedCard;
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
          const resetCard = {
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

          // Update in Supabase
          if (user) {
            supabase
              .from('user_flashcards')
              .update({
                repetitions: 0,
                ease_factor: 2.5,
                interval_days: 1,
                due_date: new Date().toISOString()
              })
              .eq('id', card.id)
              .eq('user_id', user.id);
          }

          return resetCard;
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
    <SupabaseFlashcardsContext.Provider value={{
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
    </SupabaseFlashcardsContext.Provider>
  );
}

export function useSupabaseFlashcards() {
  const context = useContext(SupabaseFlashcardsContext);
  if (context === undefined) {
    throw new Error('useSupabaseFlashcards must be used within a SupabaseFlashcardsProvider');
  }
  return context;
}
