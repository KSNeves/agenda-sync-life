
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
    
    console.log('📥 Carregando eventos para usuário:', user.id);
    
    try {
      const { data, error } = await supabase
        .from('user_events')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      console.log('📊 Eventos carregados do banco:', data?.length || 0);

      const transformedEvents: CalendarEvent[] = data.map(event => {
        console.log(`🔍 Transformando evento ${event.id}:`);
        console.log('- Título:', event.title);
        console.log('- Cor do banco:', event.color);
        
        // Garantir que sempre temos uma cor válida
        const eventColor = event.color || '#3B82F6';
        
        return {
          id: event.id,
          title: event.title,
          description: event.description || '',
          startTime: new Date(event.start_time).getTime(),
          endTime: new Date(event.end_time).getTime(),
          type: 'other' as const,
          color: eventColor,
          customColor: eventColor,
          isAllDay: event.is_all_day || false,
        };
      });

      console.log('✅ Eventos transformados para o state:', transformedEvents.length);
      transformedEvents.forEach(event => {
        console.log(`- ${event.title}: cor=${event.color}`);
      });
      
      setEvents(transformedEvents);
    } catch (error) {
      console.error('❌ Erro ao carregar eventos:', error);
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
    
    // Garantir que temos uma cor válida
    const colorToSave = event.color || '#3B82F6';
    
    console.log('💾 Adicionando evento...');
    console.log('📦 Evento original:', event);
    console.log('🎨 Cor a ser salva:', colorToSave);
    
    // Atualizar estado local primeiro com cor correta
    const eventWithCorrectColor = {
      ...eventWithUUID,
      color: colorToSave,
      customColor: colorToSave
    };
    
    setEvents(prev => [...prev, eventWithCorrectColor]);

    // Salvar no banco
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
          console.error('❌ Erro ao criar evento:', error);
          // Reverter estado local em caso de erro
          setEvents(prev => prev.filter(e => e.id !== eventWithUUID.id));
        } else {
          console.log('✅ Evento salvo com sucesso. Cor:', colorToSave);
        }
      });
  };

  const updateEvent = (event: CalendarEvent) => {
    if (!user) return;

    const colorToSave = event.color || '#3B82F6';
    
    console.log('🔄 Atualizando evento...');
    console.log('🆔 ID do evento:', event.id);
    console.log('🎨 Nova cor:', colorToSave);
    
    // Atualizar estado local com cor correta
    const updatedEvent = {
      ...event,
      color: colorToSave,
      customColor: colorToSave
    };
    
    setEvents(prev => prev.map(e => e.id === event.id ? updatedEvent : e));

    // Atualizar no banco
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
          console.error('❌ Erro ao atualizar evento:', error);
        } else {
          console.log('✅ Evento atualizado com sucesso. Nova cor:', colorToSave);
        }
      });
  };

  const deleteEvent = (id: string) => {
    console.log('🗑️ Deletando evento individual:', id);
    
    setEvents(prev => prev.filter(e => e.id !== id));

    if (user) {
      supabase
        .from('user_events')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        .then(({ error }) => {
          if (error) {
            console.error('❌ Erro ao deletar evento:', error);
          } else {
            console.log('✅ Evento deletado com sucesso:', id);
          }
        });
    }
  };

  const deleteRecurringEvents = async (eventId: string) => {
    console.log('🗑️ === EXCLUSÃO DE SÉRIE INICIADA ===');
    console.log('🆔 ID do evento clicado:', eventId);
    
    if (!user) {
      console.log('❌ Usuário não autenticado');
      return;
    }

    try {
      // Recarregar eventos do banco para dados atualizados
      const { data: freshData, error: fetchError } = await supabase
        .from('user_events')
        .select('*')
        .eq('user_id', user.id);

      if (fetchError) {
        console.error('❌ Erro ao buscar eventos atualizados:', fetchError);
        return;
      }

      console.log('📊 Eventos atualizados carregados:', freshData?.length || 0);

      // Encontrar o evento alvo
      const targetEvent = freshData?.find(e => e.id === eventId);
      if (!targetEvent) {
        console.log('⚠️ Evento não encontrado nos dados atualizados');
        return;
      }

      console.log('🎯 Evento alvo encontrado:', targetEvent.title);

      // Estratégia múltipla para encontrar eventos da série
      let seriesEvents: any[] = [];

      // 1. Se o ID contém underscore, extrair o baseId e buscar por padrão
      if (eventId.includes('_')) {
        const baseId = eventId.split('_')[0];
        console.log('🔍 Buscando série pelo baseId:', baseId);
        
        seriesEvents = freshData?.filter(event => 
          event.id === baseId || event.id.startsWith(baseId + '_')
        ) || [];
      }

      // 2. Se não encontrou ou encontrou poucos, buscar por título
      if (seriesEvents.length <= 1) {
        console.log('🔍 Buscando série pelo título:', targetEvent.title);
        
        seriesEvents = freshData?.filter(event => {
          const eventTitle = event.title.trim().toLowerCase();
          const targetTitle = targetEvent.title.trim().toLowerCase();
          return eventTitle === targetTitle;
        }) || [];
      }

      console.log('📋 Eventos da série encontrados:', seriesEvents.length);
      seriesEvents.forEach(event => {
        console.log(`- ${event.id}: ${event.title}`);
      });

      if (seriesEvents.length === 0) {
        console.log('⚠️ Nenhum evento da série encontrado, deletando apenas o evento individual');
        deleteEvent(eventId);
        return;
      }

      // Deletar todos os eventos da série
      const deletePromises = seriesEvents.map(async (event) => {
        console.log(`🗑️ Deletando do banco: ${event.id} (${event.title})`);
        
        const { error: deleteError } = await supabase
          .from('user_events')
          .delete()
          .eq('id', event.id)
          .eq('user_id', user.id);

        if (deleteError) {
          console.error(`❌ Erro ao deletar ${event.id}:`, deleteError);
          return false;
        } else {
          console.log(`✅ Evento ${event.id} deletado do banco`);
          return true;
        }
      });

      const deleteResults = await Promise.all(deletePromises);
      const successfulDeletes = deleteResults.filter(result => result).length;
      
      console.log(`📊 ${successfulDeletes}/${seriesEvents.length} eventos deletados com sucesso`);

      // Atualizar estado local removendo todos os eventos da série
      const seriesIds = seriesEvents.map(e => e.id);
      setEvents(prevEvents => {
        const filteredEvents = prevEvents.filter(event => !seriesIds.includes(event.id));
        console.log(`🔄 Estado local atualizado: ${prevEvents.length} → ${filteredEvents.length} eventos`);
        return filteredEvents;
      });

      console.log('✅ === EXCLUSÃO DE SÉRIE CONCLUÍDA ===');

    } catch (error) {
      console.error('❌ Erro inesperado na exclusão de série:', error);
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
