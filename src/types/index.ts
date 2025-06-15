
export interface Task {
  id: string;
  title: string;
  duration: number; // em minutos
  completed: boolean;
  startTime?: number; // timestamp
  elapsedTime: number; // em segundos
  isRunning: boolean;
  postponed?: boolean;
  createdAt: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: number; // timestamp
  endTime: number; // timestamp
  type: 'class' | 'study' | 'exam' | 'personal' | 'other';
  color?: string;
  customColor?: string;
  isAllDay?: boolean;
  recurrence?: {
    type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    weekdays?: number[];
    endDate?: Date;
  };
  location?: string;
  professor?: string;
}

export interface RevisionItem {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  category: 'pending' | 'completed' | 'priority';
  createdAt: number;
  completedAt?: number;
  revisionCount: number;
  nextRevisionDate: number;
  intervalDays: number;
  nonStudyDays?: number[];
}

export type CalendarView = 'day' | 'week' | 'month';
