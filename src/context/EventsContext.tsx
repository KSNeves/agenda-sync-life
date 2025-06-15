
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Event {
  id: string;
  title: string;
  description?: string;
  startTime: number;
  endTime: number;
  isAllDay: boolean;
  color: string;
  createdAt: number;
}

interface EventsContextType {
  events: Event[];
  isLoaded: boolean;
  addEvent: (event: Omit<Event, 'id' | 'createdAt'>) => Promise<void>;
  updateEvent: (event: Event) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  getEventsForDate: (date: Date) => Event[];
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadEvents();
    } else {
      setEvents([]);
      setIsLoaded(true);
    }
  }, [user]);

  const loadEvents = async () => {
    if (!user) return;

    try {
      console.log('🔄 Loading events from Supabase for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_events')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading events:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar eventos.",
          variant: "destructive",
        });
        return;
      }

      const convertedEvents: Event[] = (data || []).map(event => ({
        id: event.id,
        title: event.title,
        description: event.description || '',
        startTime: new Date(event.start_time).getTime(),
        endTime: new Date(event.end_time).getTime(),
        isAllDay: event.is_all_day || false,
        color: event.color || '#3B82F6',
        createdAt: new Date(event.created_at || '').getTime(),
      }));

      console.log('📅 Loaded events from Supabase:', convertedEvents);
      setEvents(convertedEvents);
    } catch (error) {
      console.error('Exception loading events:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar eventos.",
        variant: "destructive",
      });
    } finally {
      setIsLoaded(true);
    }
  };

  const addEvent = async (eventData: Omit<Event, 'id' | 'createdAt'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('user_events')
        .insert({
          user_id: user.id,
          title: eventData.title,
          description: eventData.description || null,
          start_time: new Date(eventData.startTime).toISOString(),
          end_time: new Date(eventData.endTime).toISOString(),
          is_all_day: eventData.isAllDay,
          color: eventData.color,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding event:', error);
        toast({
          title: "Erro",
          description: "Erro ao adicionar evento.",
          variant: "destructive",
        });
        throw error;
      }

      const newEvent: Event = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        startTime: new Date(data.start_time).getTime(),
        endTime: new Date(data.end_time).getTime(),
        isAllDay: data.is_all_day || false,
        color: data.color || '#3B82F6',
        createdAt: new Date(data.created_at).getTime(),
      };

      setEvents(prev => [...prev, newEvent]);
      
      toast({
        title: "Sucesso",
        description: "Evento adicionado com sucesso!",
      });
    } catch (error) {
      console.error('Exception adding event:', error);
      throw error;
    }
  };

  const updateEvent = async (event: Event) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_events')
        .update({
          title: event.title,
          description: event.description || null,
          start_time: new Date(event.startTime).toISOString(),
          end_time: new Date(event.endTime).toISOString(),
          is_all_day: event.isAllDay,
          color: event.color,
        })
        .eq('id', event.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating event:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar evento.",
          variant: "destructive",
        });
        return;
      }

      setEvents(prev => prev.map(e => e.id === event.id ? event : e));
      
      toast({
        title: "Sucesso",
        description: "Evento atualizado com sucesso!",
      });
    } catch (error) {
      console.error('Exception updating event:', error);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_events')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting event:', error);
        toast({
          title: "Erro",
          description: "Erro ao deletar evento.",
          variant: "destructive",
        });
        return;
      }

      setEvents(prev => prev.filter(e => e.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Evento deletado com sucesso!",
      });
    } catch (error) {
      console.error('Exception deleting event:', error);
    }
  };

  const getEventsForDate = (date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return events.filter(event => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      
      return (eventStart >= startOfDay && eventStart <= endOfDay) ||
             (eventEnd >= startOfDay && eventEnd <= endOfDay) ||
             (eventStart <= startOfDay && eventEnd >= endOfDay);
    });
  };

  return (
    <EventsContext.Provider value={{
      events,
      isLoaded,
      addEvent,
      updateEvent,
      deleteEvent,
      getEventsForDate,
    }}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
}
