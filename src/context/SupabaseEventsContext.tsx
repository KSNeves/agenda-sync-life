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
    console.log('=== EXCLUSÃO DE SÉRIE - VERSÃO CORRIGIDA ===');
    console.log('ID do evento recebido:', eventId);
    
    if (!user) {
      console.log('Usuário não autenticado');
      return;
    }

    try {
      // Buscar TODOS os eventos do usuário
      const { data: allEvents, error: fetchError } = await supabase
        .from('user_events')
        .select('*')
        .eq('user_id', user.id);

      if (fetchError) {
        console.error('Erro ao buscar eventos:', fetchError);
        return;
      }

      console.log('Total de eventos no banco:', allEvents?.length || 0);

      // Primeiro, encontrar o evento base procurando pelo título e horário
      const targetEvent = allEvents?.find(e => e.id === eventId);
      if (!targetEvent) {
        console.log('Evento alvo não encontrado');
        return;
      }

      console.log('Evento alvo encontrado:', targetEvent.title);

      // Procurar TODOS os eventos com o mesmo título (eventos da série)
      const seriesEvents = allEvents?.filter(event => {
        return event.title === targetEvent.title;
      }) || [];

      console.log('Eventos da série encontrados (mesmo título):', seriesEvents.length);
      console.log('IDs dos eventos:', seriesEvents.map(e => e.id));

      if (seriesEvents.length === 0) {
        console.log('ERRO: Nenhum evento da série encontrado!');
        return;
      }

      // Deletar TODOS os eventos da série
      console.log('Iniciando exclusão dos eventos...');
      for (const event of seriesEvents) {
        console.log(`Deletando evento: ${event.id} (${event.title})`);
        
        const { error: deleteError } = await supabase
          .from('user_events')
          .delete()
          .eq('id', event.id)
          .eq('user_id', user.id);

        if (deleteError) {
          console.error(`ERRO ao deletar ${event.id}:`, deleteError);
        } else {
          console.log(`✓ Evento ${event.id} deletado com sucesso`);
        }
      }

      // Atualizar o estado local removendo TODOS os eventos com o mesmo título
      console.log('Atualizando estado local...');
      setEvents(prevEvents => {
        const eventsToKeep = prevEvents.filter(event => {
          const shouldRemove = event.title === targetEvent.title;
          
          if (shouldRemove) {
            console.log(`Removendo do estado local: ${event.id} (${event.title})`);
          }
          
          return !shouldRemove;
        });
        
        console.log(`Estado atualizado: ${prevEvents.length} → ${eventsToKeep.length} eventos`);
        return eventsToKeep;
      });

      console.log('=== EXCLUSÃO DE SÉRIE CONCLUÍDA ===');

    } catch (error) {
      console.error('Erro inesperado na exclusão:', error);
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
