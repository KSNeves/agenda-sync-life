
import React from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import CalendarDay from './CalendarDay';
import CalendarWeek from './CalendarWeek';
import CalendarMonth from './CalendarMonth';

export default function Calendar() {
  const { state, dispatch } = useApp();
  const { selectedDate, calendarView } = state;

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    
    switch (calendarView) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    dispatch({ type: 'SET_SELECTED_DATE', payload: newDate });
  };

  const goToToday = () => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: new Date() });
  };

  const createEvent = () => {
    dispatch({ type: 'OPEN_EVENT_MODAL', payload: null });
  };

  const getTitle = () => {
    switch (calendarView) {
      case 'day':
        return selectedDate.toLocaleDateString('pt-BR', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      case 'week':
        const weekStart = new Date(selectedDate);
        weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${weekStart.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case 'month':
        return selectedDate.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' });
      default:
        return '';
    }
  };

  const renderCalendarView = () => {
    switch (calendarView) {
      case 'day':
        return <CalendarDay />;
      case 'week':
        return <CalendarWeek />;
      case 'month':
        return <CalendarMonth />;
      default:
        return <CalendarWeek />;
    }
  };

  return (
    <div className="calendar-container">
      <header className="calendar-header">
        <div className="calendar-header-left">
          <div className="calendar-navigation">
            <button
              onClick={() => navigateDate('prev')}
              className="calendar-nav-button"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => navigateDate('next')}
              className="calendar-nav-button"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <h1 className="calendar-title">{getTitle()}</h1>
        </div>
        
        <div className="calendar-header-right">
          <button
            onClick={goToToday}
            className="calendar-button today"
          >
            Hoje
          </button>
          <button
            onClick={createEvent}
            className="calendar-button create-event"
          >
            <Plus size={16} className="mr-2" />
            Criar Evento
          </button>
          
          <div className="calendar-view-selector">
            {['day', 'week', 'month'].map(view => (
              <button
                key={view}
                onClick={() => dispatch({ type: 'SET_CALENDAR_VIEW', payload: view as any })}
                className={`view-button ${calendarView === view ? 'active' : ''}`}
              >
                {view === 'day' ? 'Dia' : view === 'week' ? 'Semana' : 'Mês'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="calendar-view-container">
        {renderCalendarView()}
      </div>
    </div>
  );
}
