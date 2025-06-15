
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Flashcard, Deck } from '../types/flashcard.types';
import { calculateNextReview } from '../utils/ankiAlgorithm';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

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
  const { user } = useAuth();

  // Load data from Supabase
  const loadData = async () => {
    if (!user) {
      setDecks([]);
      setFlashcards([]);
      setIsLoaded(true);
      return;
    }

    try {
      console.log('🔄 Loading data from Supabase...');
      
      // Carregar decks
      const { data: decksData, error: decksError } = await supabase
        .from('flashcard_decks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (decksError) throw decksError;

      // Carregar flashcards
      const { data: cardsData, error: cardsError } = await supabase
        .from('flashcards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (cardsError) throw cardsError;

      const formattedDecks: Deck[] = decksData.map(deck => ({
        id: deck.id,
        name: deck.name,
        description: deck.description || '',
        createdAt: deck.created_at,
        cardCount: deck.card_count || 0,
        newCards: deck.new_cards || 0,
        reviewCards: deck.review_cards || 0,
        learnedCards: deck.learned_cards || 0
      }));

      const formattedCards: Flashcard[] = cardsData.map(card => ({
        id: card.id,
        front: card.front,
        back: card.back,
        deckId: card.deck_id,
        createdAt: card.created_at,
        reviewCount: card.review_count || 0,
        easeFactor: Number(card.ease_factor) || 2.5,
        interval: card.interval_days || 1,
        nextReview: card.next_review,
        status: card.status as Flashcard['status'] || 'learning',
        lapses: card.lapses || 0,
        learningStep: card.learning_step || 0,
        lastReviewed: card.last_reviewed
      }));

      console.log('📚 Loaded decks from Supabase:', formattedDecks);
      console.log('🃏 Loaded cards from Supabase:', formattedCards);
      
      setDecks(formattedDecks);
      setFlashcards(formattedCards);
    } catch (error) {
      console.error('Error loading data from Supabase:', error);
      setDecks([]);
      setFlashcards([]);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const createDeck = async (deckData: { name: string; description?: string }) => {
    if (!user) return '';
    
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

    try {
      const { error } = await supabase
        .from('flashcard_decks')
        .insert({
          id: newDeck.id,
          user_id: user.id,
          name: newDeck.name,
          description: newDeck.description,
          created_at: newDeck.createdAt,
          card_count: newDeck.cardCount,
          new_cards: newDeck.newCards,
          review_cards: newDeck.reviewCards,
          learned_cards: newDeck.learnedCards
        });

      if (error) throw error;
      
      await loadData();
      return newDeck.id;
    } catch (error) {
      console.error('Error creating deck:', error);
      return '';
    }
  };

  const deleteDeck = async (deckId: string) => {
    if (!user) return;

    try {
      // Deletar cards primeiro (cascade deve cuidar disso, mas vamos ser explícitos)
      await supabase
        .from('flashcards')
        .delete()
        .eq('deck_id', deckId)
        .eq('user_id', user.id);

      // Deletar deck
      await supabase
        .from('flashcard_decks')
        .delete()
        .eq('id', deckId)
        .eq('user_id', user.id);

      await loadData();
    } catch (error) {
      console.error('Error deleting deck:', error);
    }
  };

  const deleteAllDecks = async () => {
    if (!user) return;

    console.log('🗑️ Deleting all decks and flashcards...');
    try {
      // Deletar todos os cards
      await supabase
        .from('flashcards')
        .delete()
        .eq('user_id', user.id);

      // Deletar todos os decks
      await supabase
        .from('flashcard_decks')
        .delete()
        .eq('user_id', user.id);

      await loadData();
    } catch (error) {
      console.error('Error deleting all decks:', error);
    }
  };

  const getDeck = (deckId: string) => {
    return decks.find(deck => deck.id === deckId);
  };

  const addCard = async (deckId: string, cardData: { front: string; back: string }) => {
    if (!user) return;

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

    try {
      const { error } = await supabase
        .from('flashcards')
        .insert({
          id: newCard.id,
          user_id: user.id,
          deck_id: newCard.deckId,
          front: newCard.front,
          back: newCard.back,
          created_at: newCard.createdAt,
          review_count: newCard.reviewCount,
          ease_factor: newCard.easeFactor,
          interval_days: newCard.interval,
          next_review: newCard.nextReview,
          status: newCard.status,
          lapses: newCard.lapses,
          learning_step: newCard.learningStep
        });

      if (error) throw error;
      
      await updateDeckStats(deckId);
      await loadData();
    } catch (error) {
      console.error('Error adding card:', error);
    }
  };

  const deleteCard = async (cardId: string) => {
    if (!user) return;

    try {
      const card = flashcards.find(c => c.id === cardId);
      
      await supabase
        .from('flashcards')
        .delete()
        .eq('id', cardId)
        .eq('user_id', user.id);

      if (card) {
        await updateDeckStats(card.deckId);
      }
      
      await loadData();
    } catch (error) {
      console.error('Error deleting card:', error);
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

      const ankiUpdates = calculateNextReview(card, response);
      
      const { error } = await supabase
        .from('flashcards')
        .update({
          review_count: (card.reviewCount || 0) + 1,
          ease_factor: ankiUpdates.easeFactor,
          interval_days: ankiUpdates.interval,
          next_review: ankiUpdates.nextReview,
          status: ankiUpdates.status,
          lapses: ankiUpdates.lapses,
          learning_step: ankiUpdates.learningStep,
          last_reviewed: Date.now()
        })
        .eq('id', cardId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await updateDeckStats(card.deckId);
      await loadData();
    } catch (error) {
      console.error('Error reviewing card:', error);
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
      await supabase
        .from('flashcards')
        .update({
          status: 'learning',
          review_count: 0,
          lapses: 0,
          learning_step: 0,
          ease_factor: 2.5,
          interval_days: 1,
          next_review: Date.now(),
          last_reviewed: null
        })
        .eq('deck_id', deckId)
        .eq('user_id', user.id);

      await updateDeckStats(deckId);
      await loadData();
    } catch (error) {
      console.error('Error restarting studies:', error);
    }
  };

  const updateDeckStats = async (deckId: string) => {
    if (!user) return;

    try {
      const { data: cards } = await supabase
        .from('flashcards')
        .select('*')
        .eq('deck_id', deckId)
        .eq('user_id', user.id);

      if (!cards) return;

      const cardCount = cards.length;
      const newCards = cards.filter(card => card.status === 'learning' && card.review_count === 0).length;
      const reviewCards = cards.filter(card => card.status === 'learning' || card.status === 'reviewing').length;
      const learnedCards = cards.filter(card => card.status === 'learned').length;

      await supabase
        .from('flashcard_decks')
        .update({
          card_count: cardCount,
          new_cards: newCards,
          review_cards: reviewCards,
          learned_cards: learnedCards
        })
        .eq('id', deckId)
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error updating deck stats:', error);
    }
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
