
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

    // Identifica o baseId do evento (remove sufixos de recorrência)
    const baseId = eventId.includes('_') ? eventId.split('_')[0] : eventId;
    console.log('BaseId calculado:', baseId);

    try {
      // Primeiro, listar TODOS os eventos do usuário para debug
      const { data: allUserEvents, error: allEventsError } = await supabase
        .from('user_events')
        .select('id, title')
        .eq('user_id', user.id);

      if (allEventsError) {
        console.error('Erro ao buscar todos os eventos:', allEventsError);
        return;
      }

      console.log('Todos os eventos do usuário no banco:', allUserEvents?.map(e => ({ id: e.id, title: e.title })) || []);

      // Buscar eventos que começam com o baseId ou são exatamente o baseId
      const eventsToDeleteQuery = supabase
        .from('user_events')
        .select('id, title')
        .eq('user_id', user.id);

      // Usar filtro manual em JavaScript para garantir compatibilidade
      const { data: allEvents, error: fetchAllError } = await eventsToDeleteQuery;

      if (fetchAllError) {
        console.error('Erro ao buscar eventos para filtrar:', fetchAllError);
        return;
      }

      // Filtrar manualmente os eventos que pertencem à série
      const eventsToDelete = allEvents?.filter(event => 
        event.id === baseId || event.id.startsWith(`${baseId}_`)
      ) || [];

      console.log('Eventos encontrados para deletar:', eventsToDelete.map(e => ({ id: e.id, title: e.title })));

      if (eventsToDelete.length === 0) {
        console.log('Nenhum evento encontrado para deletar');
        return;
      }

      // Deletar cada evento individualmente para garantir que todos sejam removidos
      const deletePromises = eventsToDelete.map(event => 
        supabase
          .from('user_events')
          .delete()
          .eq('id', event.id)
          .eq('user_id', user.id)
      );

      const results = await Promise.all(deletePromises);
      
      // Verificar se houve erros
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error('Erros ao deletar eventos:', errors);
        return;
      }

      console.log('Todos os eventos deletados com sucesso do banco de dados');

      // Remover da lista local todos os eventos que correspondem ao padrão
      setEvents(prev => {
        const eventsToRemove = prev.filter(event => 
          event.id === baseId || event.id.startsWith(`${baseId}_`)
        );
        
        console.log('Removendo do estado local:', eventsToRemove.map(e => ({ id: e.id, title: e.title })));
        
        const newEvents = prev.filter(event => 
          event.id !== baseId && !event.id.startsWith(`${baseId}_`)
        );
        
        console.log('Estado local após remoção - total de eventos:', newEvents.length);
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
