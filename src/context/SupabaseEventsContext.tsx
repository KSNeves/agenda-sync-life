
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
      console.log('Dados brutos do banco:', data);

      const transformedEvents: CalendarEvent[] = data.map(event => {
        console.log('Transformando evento:', event.id, 'cor do banco:', event.color);
        
        return {
          id: event.id,
          title: event.title,
          description: event.description || '',
          startTime: new Date(event.start_time).getTime(),
          endTime: new Date(event.end_time).getTime(),
          type: 'other' as const,
          color: event.color || '#3B82F6',
          customColor: event.color || '#3B82F6', // Garantir que customColor seja definido
          isAllDay: event.is_all_day || false,
        };
      });

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
    
    // Garantir que temos uma cor válida para salvar
    const colorToSave = event.color || event.customColor || '#3B82F6';
    
    console.log('Adicionando evento:', eventWithUUID);
    console.log('Cor a ser salva:', colorToSave);
    console.log('Dados completos do evento:', event);
    
    // Atualizar estado local primeiro
    const eventWithCorrectColor = {
      ...eventWithUUID,
      color: colorToSave,
      customColor: colorToSave
    };
    
    setEvents(prev => [...prev, eventWithCorrectColor]);

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
          console.log('Evento salvo com sucesso no banco. Cor salva:', colorToSave);
        }
      });
  };

  const updateEvent = (event: CalendarEvent) => {
    const colorToSave = event.color || event.customColor || '#3B82F6';
    
    console.log('Atualizando evento:', event.id);
    console.log('Nova cor:', colorToSave);
    
    // Atualizar estado local com cor correta
    const updatedEvent = {
      ...event,
      color: colorToSave,
      customColor: colorToSave
    };
    
    setEvents(prev => prev.map(e => e.id === event.id ? updatedEvent : e));

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
      // Primeiro, recarregar eventos do banco para garantir dados atualizados
      const { data: freshData, error: fetchError } = await supabase
        .from('user_events')
        .select('*')
        .eq('user_id', user.id);

      if (fetchError) {
        console.error('Erro ao buscar eventos atualizados:', fetchError);
        return;
      }

      console.log('Eventos atualizados carregados:', freshData?.length || 0);

      // Encontrar o evento clicado nos dados atualizados
      const targetEvent = freshData?.find(e => e.id === eventId);
      if (!targetEvent) {
        console.log('Evento não encontrado nos dados atualizados');
        return;
      }

      console.log('Evento alvo encontrado:', targetEvent.title);

      // Encontrar todos os eventos da série (mesmo título)
      const seriesEvents = freshData?.filter(event => 
        event.title.trim().toLowerCase() === targetEvent.title.trim().toLowerCase()
      ) || [];

      console.log('Eventos da série encontrados:', seriesEvents.length);
      console.log('Títulos dos eventos da série:', seriesEvents.map(e => `${e.id}: "${e.title}"`));

      if (seriesEvents.length === 0) {
        console.log('Nenhum evento da série encontrado');
        return;
      }

      // Deletar todos os eventos da série no banco usando Promise.all para paralelizar
      const deletePromises = seriesEvents.map(async (event) => {
        console.log(`Deletando do banco: ${event.id} (${event.title})`);
        
        const { error: deleteError } = await supabase
          .from('user_events')
          .delete()
          .eq('id', event.id)
          .eq('user_id', user.id);

        if (deleteError) {
          console.error(`Erro ao deletar ${event.id}:`, deleteError);
          return false;
        } else {
          console.log(`✓ Evento ${event.id} deletado do banco`);
          return true;
        }
      });

      const deleteResults = await Promise.all(deletePromises);
      const successfulDeletes = deleteResults.filter(result => result).length;
      
      console.log(`${successfulDeletes}/${seriesEvents.length} eventos deletados com sucesso`);

      // Atualizar estado local removendo todos os eventos com o mesmo título (case insensitive)
      setEvents(prevEvents => {
        const filteredEvents = prevEvents.filter(event => 
          event.title.trim().toLowerCase() !== targetEvent.title.trim().toLowerCase()
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
