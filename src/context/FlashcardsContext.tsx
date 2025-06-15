
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Flashcard, Deck } from '../types/flashcard.types';
import { calculateNextReview } from '../utils/ankiAlgorithm';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface FlashcardsContextType {
  decks: Deck[];
  flashcards: Flashcard[];
  isLoaded: boolean;
  createDeck: (deckData: { name: string; description?: string }) => Promise<string>;
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
  const [decks, setDecks] = useState<Deck[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load data from Supabase when user changes
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      // Clear data when user logs out
      setDecks([]);
      setFlashcards([]);
      setIsLoaded(true);
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      console.log('🔄 Loading flashcards data from Supabase for user:', user.id);
      
      // Load decks
      const { data: decksData, error: decksError } = await supabase
        .from('user_flashcard_decks')
        .select('*')
        .eq('user_id', user.id);

      if (decksError) {
        console.error('Error loading decks:', decksError);
        toast({
          title: "Erro",
          description: "Erro ao carregar baralhos de flashcards.",
          variant: "destructive",
        });
        return;
      }

      // Load cards
      const { data: cardsData, error: cardsError } = await supabase
        .from('user_flashcards')
        .select('*')
        .eq('user_id', user.id);

      if (cardsError) {
        console.error('Error loading cards:', cardsError);
        toast({
          title: "Erro",
          description: "Erro ao carregar flashcards.",
          variant: "destructive",
        });
        return;
      }

      // Convert Supabase data to our format
      const convertedDecks: Deck[] = (decksData || []).map(deck => ({
        id: deck.id,
        name: deck.name,
        description: deck.description || '',
        createdAt: new Date(deck.created_at || '').getTime(),
        cardCount: 0,
        newCards: 0,
        reviewCards: 0,
        learnedCards: 0,
      }));

      const convertedCards: Flashcard[] = (cardsData || []).map(card => ({
        id: card.id,
        front: card.front,
        back: card.back,
        deckId: card.deck_id,
        createdAt: new Date(card.created_at || '').getTime(),
        reviewCount: card.repetitions || 0,
        easeFactor: card.ease_factor || 2.5,
        interval: card.interval_days || 1,
        nextReview: new Date(card.due_date || '').getTime(),
        status: 'learning',
        lapses: 0,
        learningStep: 0,
      }));

      console.log('📚 Loaded decks from Supabase:', convertedDecks);
      console.log('🃏 Loaded cards from Supabase:', convertedCards);

      setDecks(convertedDecks);
      setFlashcards(convertedCards);
      
      // Update deck stats
      convertedDecks.forEach(deck => {
        updateDeckStatsWithCards(deck.id, convertedCards);
      });

    } catch (error) {
      console.error('Exception loading flashcards data:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar dados.",
        variant: "destructive",
      });
    } finally {
      setIsLoaded(true);
    }
  };

  const createDeck = async (deckData: { name: string; description?: string }) => {
    if (!user) throw new Error('User not authenticated');

    console.log('🆕 Creating new deck:', deckData);
    
    try {
      const { data, error } = await supabase
        .from('user_flashcard_decks')
        .insert({
          user_id: user.id,
          name: deckData.name,
          description: deckData.description || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating deck:', error);
        toast({
          title: "Erro",
          description: "Erro ao criar baralho.",
          variant: "destructive",
        });
        throw error;
      }

      const newDeck: Deck = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        createdAt: new Date(data.created_at).getTime(),
        cardCount: 0,
        newCards: 0,
        reviewCards: 0,
        learnedCards: 0,
      };

      setDecks(prev => [...prev, newDeck]);
      
      toast({
        title: "Sucesso",
        description: "Baralho criado com sucesso!",
      });

      return newDeck.id;
    } catch (error) {
      console.error('Exception creating deck:', error);
      throw error;
    }
  };

  const deleteDeck = async (deckId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_flashcard_decks')
        .delete()
        .eq('id', deckId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting deck:', error);
        toast({
          title: "Erro",
          description: "Erro ao deletar baralho.",
          variant: "destructive",
        });
        return;
      }

      setDecks(prev => prev.filter(deck => deck.id !== deckId));
      setFlashcards(prev => prev.filter(card => card.deckId !== deckId));

      toast({
        title: "Sucesso",
        description: "Baralho deletado com sucesso!",
      });
    } catch (error) {
      console.error('Exception deleting deck:', error);
    }
  };

  const deleteAllDecks = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_flashcard_decks')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting all decks:', error);
        toast({
          title: "Erro",
          description: "Erro ao deletar baralhos.",
          variant: "destructive",
        });
        return;
      }

      setDecks([]);
      setFlashcards([]);

      toast({
        title: "Sucesso",
        description: "Todos os baralhos foram deletados!",
      });
    } catch (error) {
      console.error('Exception deleting all decks:', error);
    }
  };

  const getDeck = (deckId: string) => {
    return decks.find(deck => deck.id === deckId);
  };

  const addCard = async (deckId: string, cardData: { front: string; back: string }) => {
    if (!user) throw new Error('User not authenticated');

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

      if (error) {
        console.error('Error adding card:', error);
        toast({
          title: "Erro",
          description: "Erro ao adicionar card.",
          variant: "destructive",
        });
        throw error;
      }

      const newCard: Flashcard = {
        id: data.id,
        front: data.front,
        back: data.back,
        deckId: data.deck_id,
        createdAt: new Date(data.created_at).getTime(),
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

      toast({
        title: "Sucesso",
        description: "Card adicionado com sucesso!",
      });
    } catch (error) {
      console.error('Exception adding card:', error);
      throw error;
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

      if (error) {
        console.error('Error deleting card:', error);
        toast({
          title: "Erro",
          description: "Erro ao deletar card.",
          variant: "destructive",
        });
        return;
      }

      setFlashcards(prev => {
        const updated = prev.filter(c => c.id !== cardId);
        updateDeckStatsWithCards(card.deckId, updated);
        return updated;
      });

      toast({
        title: "Sucesso",
        description: "Card deletado com sucesso!",
      });
    } catch (error) {
      console.error('Exception deleting card:', error);
    }
  };

  const getCardsFromDeck = (deckId: string) => {
    return flashcards.filter(card => card.deckId === deckId);
  };

  const reviewCard = async (cardId: string, response: 'again' | 'hard' | 'good' | 'easy') => {
    if (!user) return;

    const card = flashcards.find(c => c.id === cardId);
    if (!card) return;

    try {
      const ankiUpdates = calculateNextReview(card, response);
      
      const { error } = await supabase
        .from('user_flashcards')
        .update({
          ease_factor: ankiUpdates.easeFactor,
          interval_days: ankiUpdates.interval,
          repetitions: ankiUpdates.reviewCount,
          due_date: new Date(ankiUpdates.nextReview).toISOString(),
        })
        .eq('id', cardId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error reviewing card:', error);
        toast({
          title: "Erro",
          description: "Erro ao revisar card.",
          variant: "destructive",
        });
        return;
      }

      setFlashcards(prev => {
        const updated = prev.map(c => {
          if (c.id === cardId) {
            return {
              ...c,
              ...ankiUpdates,
              lastReviewed: Date.now(),
            };
          }
          return c;
        });

        const reviewedCard = updated.find(c => c.id === cardId);
        if (reviewedCard) {
          updateDeckStatsWithCards(reviewedCard.deckId, updated);
        }
        
        return updated;
      });
    } catch (error) {
      console.error('Exception reviewing card:', error);
    }
  };

  const getDueCards = (deckId: string) => {
    const deckCards = getCardsFromDeck(deckId);
    const now = Date.now();
    return deckCards.filter(card => card.nextReview <= now);
  };

  const restartStudies = async (deckId: string) => {
    if (!user) return;

    try {
      const deckCards = getCardsFromDeck(deckId);
      const cardIds = deckCards.map(card => card.id);

      if (cardIds.length === 0) return;

      const { error } = await supabase
        .from('user_flashcards')
        .update({
          ease_factor: 2.5,
          interval_days: 1,
          repetitions: 0,
          due_date: new Date().toISOString(),
        })
        .in('id', cardIds)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error restarting studies:', error);
        toast({
          title: "Erro",
          description: "Erro ao reiniciar estudos.",
          variant: "destructive",
        });
        return;
      }

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

      toast({
        title: "Sucesso",
        description: "Estudos reiniciados com sucesso!",
      });
    } catch (error) {
      console.error('Exception restarting studies:', error);
    }
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
