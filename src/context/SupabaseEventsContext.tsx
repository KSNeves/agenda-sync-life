
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CalendarEvent } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface SupabaseEventsContextType {
  events: CalendarEvent[];
  loading: boolean;
  addEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
  updateEvent: (event: CalendarEvent) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  loadEvents: () => Promise<void>;
}

const SupabaseEventsContext = createContext<SupabaseEventsContextType | undefined>(undefined);

export function SupabaseEventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const loadEvents = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_events')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const formattedEvents: CalendarEvent[] = data.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description || '',
        startTime: new Date(event.start_time),
        endTime: new Date(event.end_time),
        type: 'other' as const,
        color: event.color || '#3B82F6',
      }));

      setEvents(formattedEvents);
    } catch (error: any) {
      console.error('Error loading events:', error);
      toast.error('Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_events')
        .insert({
          user_id: user.id,
          title: eventData.title,
          description: eventData.description,
          start_time: eventData.startTime.toISOString(),
          end_time: eventData.endTime.toISOString(),
          color: eventData.color || '#3B82F6',
          is_all_day: false,
        })
        .select()
        .single();

      if (error) throw error;

      const newEvent: CalendarEvent = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        startTime: new Date(data.start_time),
        endTime: new Date(data.end_time),
        type: 'other' as const,
        color: data.color || '#3B82F6',
      };

      setEvents(prev => [...prev, newEvent]);
      toast.success('Evento criado com sucesso!');
    } catch (error: any) {
      console.error('Error adding event:', error);
      toast.error('Erro ao criar evento');
    }
  };

  const updateEvent = async (event: CalendarEvent) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_events')
        .update({
          title: event.title,
          description: event.description,
          start_time: event.startTime.toISOString(),
          end_time: event.endTime.toISOString(),
          color: event.color || '#3B82F6',
        })
        .eq('id', event.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setEvents(prev => prev.map(e => e.id === event.id ? event : e));
      toast.success('Evento atualizado com sucesso!');
    } catch (error: any) {
      console.error('Error updating event:', error);
      toast.error('Erro ao atualizar evento');
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;

      setEvents(prev => prev.filter(e => e.id !== eventId));
      toast.success('Evento excluído com sucesso!');
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast.error('Erro ao excluir evento');
    }
  };

  useEffect(() => {
    if (user) {
      loadEvents();
    } else {
      setEvents([]);
    }
  }, [user]);

  return (
    <SupabaseEventsContext.Provider value={{
      events,
      loading,
      addEvent,
      updateEvent,
      deleteEvent,
      loadEvents,
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
