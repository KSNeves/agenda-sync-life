
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Task, CalendarEvent, RevisionItem, CalendarView } from '../types';
import { SupabaseRevisionsProvider, useSupabaseRevisions } from './SupabaseRevisionsContext';
import { SupabaseEventsProvider, useSupabaseEvents } from './SupabaseEventsContext';

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
  addRevisionItem: (item: Omit<RevisionItem, 'id'>) => void;
  updateRevisionItem: (item: RevisionItem) => void;
  deleteRevisionItem: (id: string) => void;
  clearRevisions: () => void;
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (event: CalendarEvent) => void;
  deleteEvent: (id: string) => void;
  deleteRecurringEvents: (baseId: string) => void;
  clearEvents: () => void;
} | null>(null);

function AppProviderInner({ children }: { children: ReactNode }) {
  const revisionsContext = useSupabaseRevisions();
  const eventsContext = useSupabaseEvents();

  const initialState: AppState = {
    tasks: [],
    events: eventsContext.events,
    revisionItems: revisionsContext.revisionItems,
    currentDate: new Date(),
    calendarView: 'week',
    selectedDate: new Date(),
    isEventModalOpen: false,
    selectedEvent: null,
  };

  const [state, dispatch] = useReducer(appReducer, initialState);

  // Update state when Supabase data changes
  React.useEffect(() => {
    dispatch({ type: 'SET_CURRENT_DATE', payload: new Date() });
  }, [revisionsContext.revisionItems, eventsContext.events]);

  const contextValue = {
    state: {
      ...state,
      events: eventsContext.events,
      revisionItems: revisionsContext.revisionItems,
    },
    dispatch,
    addRevisionItem: revisionsContext.addRevisionItem,
    updateRevisionItem: revisionsContext.updateRevisionItem,
    deleteRevisionItem: revisionsContext.deleteRevisionItem,
    clearRevisions: revisionsContext.clearRevisions,
    addEvent: eventsContext.addEvent,
    updateEvent: eventsContext.updateEvent,
    deleteEvent: eventsContext.deleteEvent,
    deleteRecurringEvents: eventsContext.deleteRecurringEvents,
    clearEvents: eventsContext.clearEvents,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <SupabaseRevisionsProvider>
      <SupabaseEventsProvider>
        <AppProviderInner>
          {children}
        </AppProviderInner>
      </SupabaseEventsProvider>
    </SupabaseRevisionsProvider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
