import React, { useState } from 'react';
import CalendarMonth from './CalendarMonth';
import CalendarWeek from './CalendarWeek';
import CalendarDay from './CalendarDay';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export default function Calendar() {
  const { t } = useTranslation();
  const { state, dispatch } = useApp();
  const { selectedDate } = state;
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  // Array com traduções dos dias da semana abreviados
  const dayNamesShort = [
    t('event.weekdays.sun'),
    t('event.weekdays.mon'), 
    t('event.weekdays.tue'),
    t('event.weekdays.wed'),
    t('event.weekdays.thu'),
    t('event.weekdays.fri'),
    t('event.weekdays.sat')
  ];

  const goToPrevious = () => {
    const newDate = new Date(selectedDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    dispatch({ type: 'SET_SELECTED_DATE', payload: newDate });
  };

  const goToNext = () => {
    const newDate = new Date(selectedDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    dispatch({ type: 'SET_SELECTED_DATE', payload: newDate });
  };

  const goToToday = () => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: new Date() });
  };

  return (
    <div className="calendar-container">
      {/* Header e botões de navegação */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <button onClick={goToPrevious} className="p-2 hover:bg-secondary/50 rounded-lg transition-colors">
            <ChevronLeft size={20} />
          </button>
          <button onClick={goToNext} className="p-2 hover:bg-secondary/50 rounded-lg transition-colors">
            <ChevronRight size={20} />
          </button>
          <button onClick={goToToday} className="px-4 py-2 text-foreground hover:bg-secondary/50 rounded-lg transition-colors">
            Today
          </button>
        </div>

        <div className="flex border border-border/50 rounded-lg overflow-hidden bg-card/30">
          <button 
            onClick={() => setView('day')}
            className={`px-4 py-2 ${view === 'day' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50'} transition-colors`}
          >
            Day
          </button>
          <button 
            onClick={() => setView('week')}
            className={`px-4 py-2 ${view === 'week' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50'} transition-colors`}
          >
            Week
          </button>
          <button 
            onClick={() => setView('month')}
            className={`px-4 py-2 ${view === 'month' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50'} transition-colors`}
          >
            Month
          </button>
        </div>
      </div>
      
      {view === 'month' && <CalendarMonth dayNamesShort={dayNamesShort} />}
      {view === 'week' && <CalendarWeek />}
      {view === 'day' && <CalendarDay />}
    </div>
  );
}
