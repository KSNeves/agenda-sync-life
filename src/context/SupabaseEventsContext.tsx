
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
    
    console.log('Carregando eventos para usuário:', user.id);
    
    try {
      const { data, error } = await supabase
        .from('user_events')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      console.log('Eventos carregados do banco:', data?.length || 0);

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

      console.log('Eventos transformados:', transformedEvents);
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

    const eventWithUUID = { ...event, id: generateUUID() };
    
    // Determinar a cor a ser salva - priorizar customColor, depois color
    const colorToSave = event.customColor || event.color || '#3B82F6';
    
    console.log('Adicionando evento:', eventWithUUID);
    console.log('Cor a ser salva:', colorToSave);
    
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
        color: colorToSave,
        is_all_day: eventWithUUID.isAllDay || false,
      })
      .then(({ error }) => {
        if (error) {
          console.error('Error creating event:', error);
          setEvents(prev => prev.filter(e => e.id !== eventWithUUID.id));
        } else {
          console.log('Evento criado com sucesso. Cor salva:', colorToSave);
        }
      });
  };

  const updateEvent = (event: CalendarEvent) => {
    const colorToSave = event.customColor || event.color || '#3B82F6';
    
    console.log('Atualizando evento:', event.id);
    console.log('Nova cor:', colorToSave);
    
    setEvents(prev => prev.map(e => e.id === event.id ? event : e));

    if (user) {
      supabase
        .from('user_events')
        .update({
          title: event.title,
          description: event.description,
          start_time: new Date(event.startTime).toISOString(),
          end_time: new Date(event.endTime).toISOString(),
          color: colorToSave,
          is_all_day: event.isAllDay || false,
        })
        .eq('id', event.id)
        .eq('user_id', user.id)
        .then(({ error }) => {
          if (error) {
            console.error('Error updating event:', error);
          } else {
            console.log('Evento atualizado com sucesso. Nova cor:', colorToSave);
          }
        });
    }
  };

  const deleteEvent = (id: string) => {
    console.log('Deletando evento individual:', id);
    
    setEvents(prev => prev.filter(e => e.id !== id));

    if (user) {
      supabase
        .from('user_events')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        .then(({ error }) => {
          if (error) {
            console.error('Error deleting event:', error);
          } else {
            console.log('Evento deletado com sucesso:', id);
          }
        });
    }
  };

  const deleteRecurringEvents = async (eventId: string) => {
    console.log('=== EXCLUSÃO DE SÉRIE INICIADA ===');
    console.log('ID do evento clicado:', eventId);
    
    if (!user) {
      console.log('Usuário não autenticado');
      return;
    }

    try {
      // Buscar o evento clicado
      const targetEvent = events.find(e => e.id === eventId);
      if (!targetEvent) {
        console.log('Evento não encontrado no estado local');
        return;
      }

      console.log('Evento encontrado:', targetEvent.title);

      // Buscar todos os eventos do usuário no banco
      const { data: allEventsInDB, error: fetchError } = await supabase
        .from('user_events')
        .select('*')
        .eq('user_id', user.id);

      if (fetchError) {
        console.error('Erro ao buscar eventos:', fetchError);
        return;
      }

      console.log('Total de eventos no banco:', allEventsInDB?.length || 0);

      // Encontrar todos os eventos da série (mesmo título)
      const seriesEvents = allEventsInDB?.filter(event => 
        event.title === targetEvent.title
      ) || [];

      console.log('Eventos da série encontrados:', seriesEvents.length);
      console.log('IDs dos eventos da série:', seriesEvents.map(e => e.id));

      if (seriesEvents.length === 0) {
        console.log('Nenhum evento da série encontrado');
        return;
      }

      // Deletar todos os eventos da série no banco
      for (const event of seriesEvents) {
        console.log(`Deletando do banco: ${event.id} (${event.title})`);
        
        const { error: deleteError } = await supabase
          .from('user_events')
          .delete()
          .eq('id', event.id)
          .eq('user_id', user.id);

        if (deleteError) {
          console.error(`Erro ao deletar ${event.id}:`, deleteError);
        } else {
          console.log(`✓ Evento ${event.id} deletado do banco`);
        }
      }

      // Atualizar estado local - remover todos os eventos com o mesmo título
      setEvents(prevEvents => {
        const filteredEvents = prevEvents.filter(event => 
          event.title !== targetEvent.title
        );
        
        console.log(`Estado local atualizado: ${prevEvents.length} → ${filteredEvents.length} eventos`);
        return filteredEvents;
      });

      console.log('=== EXCLUSÃO DE SÉRIE CONCLUÍDA ===');

    } catch (error) {
      console.error('Erro inesperado na exclusão de série:', error);
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
