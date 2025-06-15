
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
    console.log('=== EXCLUSÃO DE SÉRIE - VERSÃO FINAL ===');
    console.log('ID do evento recebido:', eventId);
    
    if (!user) {
      console.log('Usuário não autenticado');
      return;
    }

    try {
      // Primeiro, buscar TODOS os eventos do usuário no banco
      const { data: allEvents, error: fetchError } = await supabase
        .from('user_events')
        .select('*')
        .eq('user_id', user.id);

      if (fetchError) {
        console.error('Erro ao buscar eventos:', fetchError);
        return;
      }

      console.log('Total de eventos no banco:', allEvents?.length || 0);

      // Extrair o baseId do evento
      const baseId = eventId.includes('_') ? eventId.split('_')[0] : eventId;
      console.log('BaseId extraído:', baseId);

      // Encontrar TODOS os eventos da série usando diferentes padrões
      const seriesEvents = allEvents?.filter(event => {
        // Evento base exato
        if (event.id === baseId) {
          console.log('Encontrou evento base:', event.id);
          return true;
        }
        
        // Eventos que começam com baseId_
        if (event.id.startsWith(`${baseId}_`)) {
          console.log('Encontrou evento recorrente:', event.id);
          return true;
        }
        
        return false;
      }) || [];

      console.log('Eventos da série encontrados:', seriesEvents.map(e => ({ id: e.id, title: e.title })));

      if (seriesEvents.length === 0) {
        console.log('ERRO: Nenhum evento da série encontrado no banco!');
        return;
      }

      // Deletar cada evento individualmente para ter controle total
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

      // Atualizar o estado local removendo todos os eventos da série
      console.log('Atualizando estado local...');
      setEvents(prevEvents => {
        const eventsToKeep = prevEvents.filter(event => {
          const eventBaseId = event.id.includes('_') ? event.id.split('_')[0] : event.id;
          const shouldRemove = eventBaseId === baseId;
          
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
