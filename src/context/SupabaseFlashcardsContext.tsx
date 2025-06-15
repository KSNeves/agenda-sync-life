
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Flashcard, Deck } from '../types/flashcard.types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface SupabaseFlashcardsContextType {
  decks: Deck[];
  flashcards: Flashcard[];
  loading: boolean;
  createDeck: (deckData: { name: string; description?: string }) => Promise<string | null>;
  deleteDeck: (deckId: string) => Promise<void>;
  getDeck: (deckId: string) => Deck | undefined;
  addCard: (deckId: string, cardData: { front: string; back: string }) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  getCardsFromDeck: (deckId: string) => Flashcard[];
  reviewCard: (cardId: string, response: 'again' | 'hard' | 'good' | 'easy') => Promise<void>;
  getDueCards: (deckId: string) => Flashcard[];
  loadDecksAndCards: () => Promise<void>;
}

const SupabaseFlashcardsContext = createContext<SupabaseFlashcardsContextType | undefined>(undefined);

export function SupabaseFlashcardsProvider({ children }: { children: ReactNode }) {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const loadDecksAndCards = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load decks
      const { data: decksData, error: decksError } = await supabase
        .from('user_flashcard_decks')
        .select('*')
        .eq('user_id', user.id);

      if (decksError) throw decksError;

      // Load flashcards
      const { data: cardsData, error: cardsError } = await supabase
        .from('user_flashcards')
        .select('*')
        .eq('user_id', user.id);

      if (cardsError) throw cardsError;

      const formattedDecks: Deck[] = decksData.map(deck => ({
        id: deck.id,
        name: deck.name,
        description: deck.description || '',
        createdAt: new Date(deck.created_at || '').getTime(),
        cardCount: 0,
        newCards: 0,
        reviewCards: 0,
        learnedCards: 0,
      }));

      const formattedCards: Flashcard[] = cardsData.map(card => ({
        id: card.id,
        front: card.front,
        back: card.back,
        deckId: card.deck_id,
        createdAt: new Date(card.created_at || '').getTime(),
        reviewCount: card.repetitions || 0,
        easeFactor: card.ease_factor || 2.5,
        interval: card.interval_days || 1,
        nextReview: new Date(card.due_date || '').getTime(),
        status: 'learning' as const,
        lapses: 0,
        learningStep: 0,
      }));

      // Update deck stats
      const updatedDecks = formattedDecks.map(deck => {
        const deckCards = formattedCards.filter(card => card.deckId === deck.id);
        return {
          ...deck,
          cardCount: deckCards.length,
          newCards: deckCards.filter(card => card.reviewCount === 0).length,
          reviewCards: deckCards.filter(card => card.reviewCount > 0).length,
          learnedCards: deckCards.filter(card => card.reviewCount > 2).length,
        };
      });

      setDecks(updatedDecks);
      setFlashcards(formattedCards);
    } catch (error: any) {
      console.error('Error loading flashcards:', error);
      toast.error('Erro ao carregar flashcards');
    } finally {
      setLoading(false);
    }
  };

  const createDeck = async (deckData: { name: string; description?: string }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_flashcard_decks')
        .insert({
          user_id: user.id,
          name: deckData.name,
          description: deckData.description || '',
        })
        .select()
        .single();

      if (error) throw error;

      const newDeck: Deck = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        createdAt: new Date(data.created_at || '').getTime(),
        cardCount: 0,
        newCards: 0,
        reviewCards: 0,
        learnedCards: 0,
      };

      setDecks(prev => [...prev, newDeck]);
      toast.success('Deck criado com sucesso!');
      return data.id;
    } catch (error: any) {
      console.error('Error creating deck:', error);
      toast.error('Erro ao criar deck');
      return null;
    }
  };

  const deleteDeck = async (deckId: string) => {
    if (!user) return;

    try {
      // Delete all cards first (cascade should handle this, but being explicit)
      await supabase
        .from('user_flashcards')
        .delete()
        .eq('deck_id', deckId)
        .eq('user_id', user.id);

      // Delete deck
      const { error } = await supabase
        .from('user_flashcard_decks')
        .delete()
        .eq('id', deckId)
        .eq('user_id', user.id);

      if (error) throw error;

      setDecks(prev => prev.filter(deck => deck.id !== deckId));
      setFlashcards(prev => prev.filter(card => card.deckId !== deckId));
      toast.success('Deck excluído com sucesso!');
    } catch (error: any) {
      console.error('Error deleting deck:', error);
      toast.error('Erro ao excluir deck');
    }
  };

  const getDeck = (deckId: string) => {
    return decks.find(deck => deck.id === deckId);
  };

  const addCard = async (deckId: string, cardData: { front: string; back: string }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_flashcards')
        .insert({
          user_id: user.id,
          deck_id: deckId,
          front: cardData.front,
          back: cardData.back,
          ease_factor: 2.5,
          interval_days: 1,
          repetitions: 0,
          due_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      const newCard: Flashcard = {
        id: data.id,
        front: data.front,
        back: data.back,
        deckId: data.deck_id,
        createdAt: new Date(data.created_at || '').getTime(),
        reviewCount: data.repetitions || 0,
        easeFactor: data.ease_factor || 2.5,
        interval: data.interval_days || 1,
        nextReview: new Date(data.due_date || '').getTime(),
        status: 'learning' as const,
        lapses: 0,
        learningStep: 0,
      };

      setFlashcards(prev => [...prev, newCard]);
      
      // Update deck stats
      setDecks(prev => prev.map(deck => {
        if (deck.id === deckId) {
          return {
            ...deck,
            cardCount: deck.cardCount + 1,
            newCards: deck.newCards + 1,
          };
        }
        return deck;
      }));

      toast.success('Card criado com sucesso!');
    } catch (error: any) {
      console.error('Error adding card:', error);
      toast.error('Erro ao criar card');
    }
  };

  const deleteCard = async (cardId: string) => {
    if (!user) return;

    try {
      const card = flashcards.find(c => c.id === cardId);
      if (!card) return;

      const { error } = await supabase
        .from('user_flashcards')
        .delete()
        .eq('id', cardId)
        .eq('user_id', user.id);

      if (error) throw error;

      setFlashcards(prev => prev.filter(c => c.id !== cardId));
      
      // Update deck stats
      setDecks(prev => prev.map(deck => {
        if (deck.id === card.deckId) {
          return {
            ...deck,
            cardCount: deck.cardCount - 1,
            newCards: card.reviewCount === 0 ? deck.newCards - 1 : deck.newCards,
            reviewCards: card.reviewCount > 0 ? deck.reviewCards - 1 : deck.reviewCards,
          };
        }
        return deck;
      }));

      toast.success('Card excluído com sucesso!');
    } catch (error: any) {
      console.error('Error deleting card:', error);
      toast.error('Erro ao excluir card');
    }
  };

  const getCardsFromDeck = (deckId: string) => {
    return flashcards.filter(card => card.deckId === deckId);
  };

  const reviewCard = async (cardId: string, response: 'again' | 'hard' | 'good' | 'easy') => {
    if (!user) return;

    try {
      const card = flashcards.find(c => c.id === cardId);
      if (!card) return;

      // Simple spaced repetition algorithm
      let newInterval = card.interval;
      let newEaseFactor = card.easeFactor;
      let newRepetitions = card.reviewCount + 1;

      switch (response) {
        case 'again':
          newInterval = 1;
          newRepetitions = 0;
          newEaseFactor = Math.max(1.3, card.easeFactor - 0.2);
          break;
        case 'hard':
          newInterval = Math.max(1, Math.round(card.interval * 1.2));
          newEaseFactor = Math.max(1.3, card.easeFactor - 0.15);
          break;
        case 'good':
          newInterval = Math.round(card.interval * card.easeFactor);
          break;
        case 'easy':
          newInterval = Math.round(card.interval * card.easeFactor * 1.3);
          newEaseFactor = card.easeFactor + 0.15;
          break;
      }

      const newDueDate = new Date();
      newDueDate.setDate(newDueDate.getDate() + newInterval);

      const { error } = await supabase
        .from('user_flashcards')
        .update({
          ease_factor: newEaseFactor,
          interval_days: newInterval,
          repetitions: newRepetitions,
          due_date: newDueDate.toISOString(),
        })
        .eq('id', cardId)
        .eq('user_id', user.id);

      if (error) throw error;

      setFlashcards(prev => prev.map(c => {
        if (c.id === cardId) {
          return {
            ...c,
            reviewCount: newRepetitions,
            easeFactor: newEaseFactor,
            interval: newInterval,
            nextReview: newDueDate.getTime(),
            lastReviewed: Date.now(),
          };
        }
        return c;
      }));

    } catch (error: any) {
      console.error('Error reviewing card:', error);
      toast.error('Erro ao revisar card');
    }
  };

  const getDueCards = (deckId: string) => {
    const deckCards = getCardsFromDeck(deckId);
    const now = Date.now();
    return deckCards.filter(card => card.nextReview <= now);
  };

  useEffect(() => {
    if (user) {
      loadDecksAndCards();
    } else {
      setDecks([]);
      setFlashcards([]);
    }
  }, [user]);

  return (
    <SupabaseFlashcardsContext.Provider value={{
      decks,
      flashcards,
      loading,
      createDeck,
      deleteDeck,
      getDeck,
      addCard,
      deleteCard,
      getCardsFromDeck,
      reviewCard,
      getDueCards,
      loadDecksAndCards,
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
