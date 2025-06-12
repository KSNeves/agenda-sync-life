
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
  startTime: Date;
  endTime: Date;
  type: 'class' | 'study' | 'exam' | 'personal' | 'other';
  color?: string;
  recurrence?: {
    type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    weekdays?: number[]; // 0-6, domingo a sábado
    endDate?: Date;
  };
  location?: string;
  professor?: string;
}

export interface RevisionItem {
  id: string;
  title: string;
  description?: string;
  category: 'pending' | 'completed' | 'priority';
  createdAt: number;
  completedAt?: number;
}

export type CalendarView = 'day' | 'week' | 'month';
