import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Task, CalendarEvent, RevisionItem, CalendarView } from '../types';

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
  | { type: 'ADD_EVENT'; payload: CalendarEvent }
  | { type: 'UPDATE_EVENT'; payload: CalendarEvent }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'DELETE_RECURRING_EVENTS'; payload: string }
  | { type: 'SET_CALENDAR_VIEW'; payload: CalendarView }
  | { type: 'SET_SELECTED_DATE'; payload: Date }
  | { type: 'SET_CURRENT_DATE'; payload: Date }
  | { type: 'OPEN_EVENT_MODAL'; payload: CalendarEvent | null }
  | { type: 'CLOSE_EVENT_MODAL' }
  | { type: 'ADD_REVISION_ITEM'; payload: RevisionItem }
  | { type: 'UPDATE_REVISION_ITEM'; payload: RevisionItem }
  | { type: 'DELETE_REVISION_ITEM'; payload: string };

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
    
    case 'ADD_EVENT':
      return { ...state, events: [...state.events, action.payload] };
    
    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map(event => 
          event.id === action.payload.id ? action.payload : event
        ),
      };
    
    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter(event => event.id !== action.payload),
      };
    
    case 'DELETE_RECURRING_EVENTS':
      return {
        ...state,
        events: state.events.filter(event => {
          // Remove o evento original e todos os eventos que começam com o baseId
          const baseId = action.payload;
          return event.id !== baseId && !event.id.startsWith(`${baseId}_`);
        }),
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
    
    case 'ADD_REVISION_ITEM':
      return { ...state, revisionItems: [...state.revisionItems, action.payload] };
    
    case 'UPDATE_REVISION_ITEM':
      return {
        ...state,
        revisionItems: state.revisionItems.map(item => 
          item.id === action.payload.id ? action.payload : item
        ),
      };
    
    case 'DELETE_REVISION_ITEM':
      return {
        ...state,
        revisionItems: state.revisionItems.filter(item => item.id !== action.payload),
      };
    
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
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
