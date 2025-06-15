import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Task, CalendarEvent, RevisionItem } from '../types';
import { useSupabaseCalendarEvents, useSupabaseRevisions } from '../hooks/useSupabaseData';

interface AppState {
  tasks: Task[];
  events: CalendarEvent[];
  revisionItems: RevisionItem[];
}

type AppAction = 
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'START_TASK'; payload: string }
  | { type: 'PAUSE_TASK'; payload: string }
  | { type: 'COMPLETE_TASK'; payload: string }
  | { type: 'UPDATE_TASK_TIMER'; payload: { id: string; elapsedTime: number } }
  | { type: 'ADD_EVENT'; payload: CalendarEvent }
  | { type: 'UPDATE_EVENT'; payload: CalendarEvent }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'DELETE_RECURRING_EVENTS'; payload: string }
  | { type: 'CLEAR_EVENTS' }
  | { type: 'SET_EVENTS'; payload: CalendarEvent[] }
  | { type: 'ADD_REVISION_ITEM'; payload: RevisionItem }
  | { type: 'UPDATE_REVISION_ITEM'; payload: RevisionItem }
  | { type: 'DELETE_REVISION_ITEM'; payload: string }
  | { type: 'SET_REVISION_ITEMS'; payload: RevisionItem[] };

const initialState: AppState = {
  tasks: [],
  events: [],
  revisionItems: []
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload]
      };

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload.id ? action.payload : task
        )
      };

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };

    case 'START_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload 
            ? { ...task, isRunning: true, startTime: Date.now() }
            : { ...task, isRunning: false }
        )
      };

    case 'PAUSE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload 
            ? { ...task, isRunning: false, startTime: undefined }
            : task
        )
      };

    case 'COMPLETE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload 
            ? { ...task, completed: true, isRunning: false, startTime: undefined }
            : task
        )
      };

    case 'UPDATE_TASK_TIMER':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload.id 
            ? { ...task, elapsedTime: action.payload.elapsedTime }
            : task
        )
      };

    // Event actions
    case 'SET_EVENTS':
      return {
        ...state,
        events: action.payload
      };

    case 'ADD_EVENT':
      return {
        ...state,
        events: [...state.events, action.payload]
      };

    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map(event => 
          event.id === action.payload.id ? action.payload : event
        )
      };

    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter(event => event.id !== action.payload)
      };

    case 'DELETE_RECURRING_EVENTS':
      return {
        ...state,
        events: state.events.filter(event => 
          !event.id.startsWith(action.payload)
        )
      };

    case 'CLEAR_EVENTS':
      return {
        ...state,
        events: []
      };

    // Revision actions
    case 'SET_REVISION_ITEMS':
      return {
        ...state,
        revisionItems: action.payload
      };

    case 'ADD_REVISION_ITEM':
      return {
        ...state,
        revisionItems: [...state.revisionItems, action.payload]
      };

    case 'UPDATE_REVISION_ITEM':
      return {
        ...state,
        revisionItems: state.revisionItems.map(item => 
          item.id === action.payload.id ? action.payload : item
        )
      };

    case 'DELETE_REVISION_ITEM':
      return {
        ...state,
        revisionItems: state.revisionItems.filter(item => item.id !== action.payload)
      };

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Hooks do Supabase
  const { 
    events, 
    isLoaded: eventsLoaded, 
    addEvent, 
    updateEvent, 
    deleteEvent, 
    deleteRecurringEvents, 
    clearEvents 
  } = useSupabaseCalendarEvents();
  
  const { 
    revisionItems, 
    isLoaded: revisionsLoaded, 
    addRevision, 
    updateRevision, 
    deleteRevision, 
    clearRevisions 
  } = useSupabaseRevisions();

  // Sincronizar eventos do Supabase com o estado local
  useEffect(() => {
    if (eventsLoaded) {
      dispatch({ type: 'SET_EVENTS', payload: events });
    }
  }, [events, eventsLoaded]);

  // Sincronizar revisões do Supabase com o estado local
  useEffect(() => {
    if (revisionsLoaded) {
      dispatch({ type: 'SET_REVISION_ITEMS', payload: revisionItems });
    }
  }, [revisionItems, revisionsLoaded]);

  // Enhanced dispatch que sincroniza com Supabase
  const enhancedDispatch = async (action: AppAction) => {
    // Primeiro atualiza o estado local
    dispatch(action);

    // Depois sincroniza com Supabase quando necessário
    try {
      switch (action.type) {
        case 'ADD_EVENT':
          await addEvent(action.payload);
          break;
        case 'UPDATE_EVENT':
          await updateEvent(action.payload);
          break;
        case 'DELETE_EVENT':
          await deleteEvent(action.payload);
          break;
        case 'DELETE_RECURRING_EVENTS':
          await deleteRecurringEvents(action.payload);
          break;
        case 'CLEAR_EVENTS':
          await clearEvents();
          break;
        case 'ADD_REVISION_ITEM':
          await addRevision(action.payload);
          break;
        case 'UPDATE_REVISION_ITEM':
          await updateRevision(action.payload);
          break;
        case 'DELETE_REVISION_ITEM':
          await deleteRevision(action.payload);
          break;
        default:
          // Para ações que não precisam sincronizar com Supabase (tasks)
          break;
      }
    } catch (error) {
      console.error('Erro ao sincronizar com Supabase:', error);
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch: enhancedDispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
