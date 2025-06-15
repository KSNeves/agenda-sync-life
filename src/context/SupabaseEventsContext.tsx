
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CalendarEvent } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { generateUUID } from '../utils/uuid';

interface EventsContextType {
  events: CalendarEvent[];
  isLoaded: boolean;
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (event: CalendarEvent) => void;
  deleteEvent: (id: string) => void;
  deleteRecurringEvents: (baseId: string) => void;
  clearEvents: () => void;
}

const SupabaseEventsContext = createContext<EventsContextType | undefined>(undefined);

export function SupabaseEventsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadEvents = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_events')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const transformedEvents: CalendarEvent[] = data.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description || '',
        startTime: new Date(event.start_time).getTime(),
        endTime: new Date(event.end_time).getTime(),
        type: 'other' as const,
        color: event.color || '#3B82F6',
        isAllDay: event.is_all_day || false,
      }));

      setEvents(transformedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadEvents();
    } else {
      setEvents([]);
    }
    setIsLoaded(true);
  }, [user]);

  const addEvent = (event: CalendarEvent) => {
    if (!user) return;

    // Generate a proper UUID
    const eventWithUUID = { ...event, id: generateUUID() };
    
    setEvents(prev => [...prev, eventWithUUID]);

    supabase
      .from('user_events')
      .insert({
        id: eventWithUUID.id,
        user_id: user.id,
        title: eventWithUUID.title,
        description: eventWithUUID.description,
        start_time: new Date(eventWithUUID.startTime).toISOString(),
        end_time: new Date(eventWithUUID.endTime).toISOString(),
        color: eventWithUUID.color,
        is_all_day: eventWithUUID.isAllDay || false,
      })
      .then(({ error }) => {
        if (error) {
          console.error('Error creating event:', error);
          setEvents(prev => prev.filter(e => e.id !== eventWithUUID.id));
        }
      });
  };

  const updateEvent = (event: CalendarEvent) => {
    setEvents(prev => prev.map(e => e.id === event.id ? event : e));

    if (user) {
      supabase
        .from('user_events')
        .update({
          title: event.title,
          description: event.description,
          start_time: new Date(event.startTime).toISOString(),
          end_time: new Date(event.endTime).toISOString(),
          color: event.color,
          is_all_day: event.isAllDay || false,
        })
        .eq('id', event.id)
        .eq('user_id', user.id);
    }
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));

    if (user) {
      supabase
        .from('user_events')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
    }
  };

  const deleteRecurringEvents = async (eventId: string) => {
    console.log('=== INICIANDO EXCLUSÃO DE SÉRIE ===');
    console.log('EventId recebido:', eventId);
    
    if (!user) {
      console.log('Usuário não autenticado');
      return;
    }

    // Identifica o baseId do evento (remove sufixos de recorrência se existirem)
    let baseId = eventId;
    if (eventId.includes('_')) {
      // Se o ID contém underscore, pega apenas a parte antes do primeiro underscore
      baseId = eventId.split('_')[0];
    }
    console.log('BaseId calculado:', baseId);

    try {
      // Buscar TODOS os eventos do usuário para garantir que encontramos os relacionados
      const { data: allUserEvents, error: fetchError } = await supabase
        .from('user_events')
        .select('id, title')
        .eq('user_id', user.id);

      if (fetchError) {
        console.error('Erro ao buscar eventos do usuário:', fetchError);
        return;
      }

      console.log('Todos os eventos do usuário:', allUserEvents?.map(e => ({ id: e.id, title: e.title })) || []);

      // Filtrar eventos que pertencem à série:
      // 1. O evento base (ID exato)
      // 2. Eventos recorrentes (que começam com baseId + "_")
      const eventsToDelete = allUserEvents?.filter(event => {
        const isBaseEvent = event.id === baseId;
        const isRecurringEvent = event.id.startsWith(`${baseId}_`);
        return isBaseEvent || isRecurringEvent;
      }) || [];

      console.log('Eventos da série encontrados para deletar:', eventsToDelete.map(e => ({ id: e.id, title: e.title })));

      if (eventsToDelete.length === 0) {
        console.log('Nenhum evento da série encontrado para deletar');
        return;
      }

      // Deletar os eventos no banco de dados usando Promise.all para garantir que todos sejam deletados
      const deletePromises = eventsToDelete.map(event => {
        console.log('Deletando evento no banco:', event.id);
        return supabase
          .from('user_events')
          .delete()
          .eq('id', event.id)
          .eq('user_id', user.id);
      });

      const deleteResults = await Promise.all(deletePromises);
      
      // Verificar se houve erros nas exclusões
      const deleteErrors = deleteResults.filter(result => result.error);
      if (deleteErrors.length > 0) {
        console.error('Erros ao deletar eventos no banco:', deleteErrors.map(r => r.error));
        return;
      }

      console.log('Todos os eventos da série deletados do banco com sucesso');

      // Remover os eventos do estado local
      setEvents(prev => {
        const eventsBeforeFilter = prev.length;
        const newEvents = prev.filter(event => {
          const shouldKeep = event.id !== baseId && !event.id.startsWith(`${baseId}_`);
          if (!shouldKeep) {
            console.log('Removendo do estado local:', event.id, event.title);
          }
          return shouldKeep;
        });
        
        console.log(`Estado local: ${eventsBeforeFilter} eventos antes, ${newEvents.length} eventos depois`);
        return newEvents;
      });

      console.log('=== EXCLUSÃO DE SÉRIE CONCLUÍDA COM SUCESSO ===');

    } catch (error) {
      console.error('Erro inesperado ao deletar eventos recorrentes:', error);
    }
  };

  const clearEvents = () => {
    setEvents([]);

    if (user) {
      supabase
        .from('user_events')
        .delete()
        .eq('user_id', user.id);
    }
  };

  return (
    <SupabaseEventsContext.Provider value={{
      events,
      isLoaded,
      addEvent,
      updateEvent,
      deleteEvent,
      deleteRecurringEvents,
      clearEvents,
    }}>
      {children}
    </SupabaseEventsContext.Provider>
  );
}

export function useSupabaseEvents() {
  const context = useContext(SupabaseEventsContext);
  if (context === undefined) {
    throw new Error('useSupabaseEvents must be used within a SupabaseEventsProvider');
  }
  return context;
}
