
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Task, CalendarEvent, RevisionItem, CalendarView } from '../types';
import { useSupabaseEvents } from './SupabaseEventsContext';
import { useSupabaseRevisions } from './SupabaseRevisionsContext';

interface AppState {
  tasks: Task[];
  events: CalendarEvent[];
  revisionItems: RevisionItem[];
  currentDate: Date;
  calendarView: CalendarView;
  selectedDate: Date;
  isEventModalOpen: boolean;
  selectedEvent: CalendarEvent | null;
}

type AppAction = 
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'START_TASK'; payload: string }
  | { type: 'PAUSE_TASK'; payload: string }
  | { type: 'RESUME_TASK'; payload: string }
  | { type: 'COMPLETE_TASK'; payload: string }
  | { type: 'POSTPONE_TASK'; payload: string }
  | { type: 'UPDATE_TASK_TIMER'; payload: { id: string; elapsedTime: number } }
  | { type: 'SET_CALENDAR_VIEW'; payload: CalendarView }
  | { type: 'SET_SELECTED_DATE'; payload: Date }
  | { type: 'SET_CURRENT_DATE'; payload: Date }
  | { type: 'OPEN_EVENT_MODAL'; payload: CalendarEvent | null }
  | { type: 'CLOSE_EVENT_MODAL' };

const initialState: AppState = {
  tasks: [],
  events: [],
  revisionItems: [],
  currentDate: new Date(),
  calendarView: 'week',
  selectedDate: new Date(),
  isEventModalOpen: false,
  selectedEvent: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload.id ? action.payload : task
        ),
      };
    
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };
    
    case 'START_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload 
            ? { ...task, isRunning: true, startTime: Date.now() }
            : { ...task, isRunning: false }
        ),
      };
    
    case 'PAUSE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload ? { ...task, isRunning: false } : task
        ),
      };
    
    case 'RESUME_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload 
            ? { ...task, isRunning: true, startTime: Date.now() }
            : { ...task, isRunning: false }
        ),
      };
    
    case 'COMPLETE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload 
            ? { ...task, completed: true, isRunning: false }
            : task
        ),
      };
    
    case 'POSTPONE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload 
            ? { ...task, postponed: true, isRunning: false }
            : task
        ),
      };
    
    case 'UPDATE_TASK_TIMER':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload.id 
            ? { ...task, elapsedTime: action.payload.elapsedTime }
            : task
        ),
      };
    
    case 'SET_CALENDAR_VIEW':
      return { ...state, calendarView: action.payload };
    
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload };
    
    case 'SET_CURRENT_DATE':
      return { ...state, currentDate: action.payload };
    
    case 'OPEN_EVENT_MODAL':
      return { ...state, isEventModalOpen: true, selectedEvent: action.payload };
    
    case 'CLOSE_EVENT_MODAL':
      return { ...state, isEventModalOpen: false, selectedEvent: null };
    
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  events: CalendarEvent[];
  revisionItems: RevisionItem[];
  addEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
  updateEvent: (event: CalendarEvent) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  addRevisionItem: (item: Omit<RevisionItem, 'id'>) => Promise<void>;
  updateRevisionItem: (item: RevisionItem) => Promise<void>;
  deleteRevisionItem: (itemId: string) => Promise<void>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const supabaseEvents = useSupabaseEvents();
  const supabaseRevisions = useSupabaseRevisions();

  return (
    <AppContext.Provider value={{
      state: {
        ...state,
        events: supabaseEvents.events,
        revisionItems: supabaseRevisions.revisionItems,
      },
      dispatch,
      events: supabaseEvents.events,
      revisionItems: supabaseRevisions.revisionItems,
      addEvent: supabaseEvents.addEvent,
      updateEvent: supabaseEvents.updateEvent,
      deleteEvent: supabaseEvents.deleteEvent,
      addRevisionItem: supabaseRevisions.addRevisionItem,
      updateRevisionItem: supabaseRevisions.updateRevisionItem,
      deleteRevisionItem: supabaseRevisions.deleteRevisionItem,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
