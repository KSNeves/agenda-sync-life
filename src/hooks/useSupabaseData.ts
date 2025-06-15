
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../context/AuthContext';
import type { CalendarEvent, RevisionItem } from '../types';
import type { Flashcard, Deck } from '../types/flashcard.types';

export function useSupabaseCalendarEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadEvents = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const formattedEvents: CalendarEvent[] = data.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description || '',
        startTime: new Date(event.start_time),
        endTime: new Date(event.end_time),
        type: event.type as CalendarEvent['type'],
        customColor: event.color || 'blue',
        recurrence: event.is_recurring ? {
          type: event.recurrence_type as any,
          weekdays: []
        } : undefined
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [user]);

  const addEvent = async (event: CalendarEvent) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('calendar_events')
        .insert({
          id: event.id,
          user_id: user.id,
          title: event.title,
          description: event.description,
          start_time: event.startTime.getTime(),
          end_time: event.endTime.getTime(),
          type: event.type,
          color: event.customColor,
          is_recurring: !!event.recurrence,
          recurrence_type: event.recurrence?.type
        });

      if (error) throw error;
      await loadEvents();
    } catch (error) {
      console.error('Erro ao adicionar evento:', error);
    }
  };

  const updateEvent = async (event: CalendarEvent) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('calendar_events')
        .update({
          title: event.title,
          description: event.description,
          start_time: event.startTime.getTime(),
          end_time: event.endTime.getTime(),
          type: event.type,
          color: event.customColor,
          is_recurring: !!event.recurrence,
          recurrence_type: event.recurrence?.type
        })
        .eq('id', event.id)
        .eq('user_id', user.id);

      if (error) throw error;
      await loadEvents();
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;
      await loadEvents();
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
    }
  };

  const deleteRecurringEvents = async (baseId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('user_id', user.id)
        .or(`id.eq.${baseId},id.like.${baseId}_%`);

      if (error) throw error;
      await loadEvents();
    } catch (error) {
      console.error('Erro ao deletar eventos recorrentes:', error);
    }
  };

  const clearEvents = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      await loadEvents();
    } catch (error) {
      console.error('Erro ao limpar eventos:', error);
    }
  };

  return {
    events,
    isLoaded,
    addEvent,
    updateEvent,
    deleteEvent,
    deleteRecurringEvents,
    clearEvents
  };
}

export function useSupabaseRevisions() {
  const { user } = useAuth();
  const [revisionItems, setRevisionItems] = useState<RevisionItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadRevisions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('revision_items')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const formattedRevisions: RevisionItem[] = data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        category: item.category as RevisionItem['category'],
        createdAt: item.created_at,
        revisionCount: item.revision_count || 0,
        nextRevisionDate: item.next_revision_date,
        intervalDays: item.interval_days || 1,
        nonStudyDays: item.non_study_days || [],
        completedAt: item.completed_at
      }));

      setRevisionItems(formattedRevisions);
    } catch (error) {
      console.error('Erro ao carregar revisões:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadRevisions();
  }, [user]);

  const addRevision = async (item: RevisionItem) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('revision_items')
        .insert({
          id: item.id,
          user_id: user.id,
          title: item.title,
          description: item.description,
          category: item.category,
          created_at: item.createdAt,
          revision_count: item.revisionCount,
          next_revision_date: item.nextRevisionDate,
          interval_days: item.intervalDays,
          non_study_days: item.nonStudyDays,
          completed_at: item.completedAt
        });

      if (error) throw error;
      await loadRevisions();
    } catch (error) {
      console.error('Erro ao adicionar revisão:', error);
    }
  };

  const updateRevision = async (item: RevisionItem) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('revision_items')
        .update({
          title: item.title,
          description: item.description,
          category: item.category,
          revision_count: item.revisionCount,
          next_revision_date: item.nextRevisionDate,
          interval_days: item.intervalDays,
          non_study_days: item.nonStudyDays,
          completed_at: item.completedAt
        })
        .eq('id', item.id)
        .eq('user_id', user.id);

      if (error) throw error;
      await loadRevisions();
    } catch (error) {
      console.error('Erro ao atualizar revisão:', error);
    }
  };

  const deleteRevision = async (itemId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('revision_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (error) throw error;
      await loadRevisions();
    } catch (error) {
      console.error('Erro ao deletar revisão:', error);
    }
  };

  const clearRevisions = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('revision_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      await loadRevisions();
    } catch (error) {
      console.error('Erro ao limpar revisões:', error);
    }
  };

  return {
    revisionItems,
    isLoaded,
    addRevision,
    updateRevision,
    deleteRevision,
    clearRevisions
  };
}

export function useSupabaseFlashcards() {
  const { user } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadData = async () => {
    if (!user) return;
    
    try {
      // Carregar decks
      const { data: decksData, error: decksError } = await supabase
        .from('flashcard_decks')
        .select('*')
        .eq('user_id', user.id);

      if (decksError) throw decksError;

      // Carregar flashcards
      const { data: cardsData, error: cardsError } = await supabase
        .from('flashcards')
        .select('*')
        .eq('user_id', user.id);

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

      setDecks(formattedDecks);
      setFlashcards(formattedCards);
    } catch (error) {
      console.error('Erro ao carregar dados dos flashcards:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  return {
    decks,
    flashcards,
    isLoaded,
    loadData
  };
}
