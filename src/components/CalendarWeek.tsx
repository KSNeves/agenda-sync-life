
import React from 'react';
import { useApp } from '../context/AppContext';

export default function CalendarWeek() {
  const { state, dispatch } = useApp();
  const { selectedDate, events } = state;

  const weekStart = new Date(selectedDate);
  weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    return day;
  });

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getCurrentTimePosition = () => {
    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    return (hour * 60 + minutes) / (24 * 60) * 100;
  };

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === day.toDateString();
    });
  };

  const getEventPosition = (event: any) => {
    const startTime = new Date(event.startTime);
    const endTime = new Date(event.endTime);
    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    
    return {
      top: `${(startMinutes / (24 * 60)) * 100}%`,
      height: `${(duration / (24 * 60)) * 100}%`,
    };
  };

  const handleCellClick = (day: Date, hour: number) => {
    const startTime = new Date(day);
    startTime.setHours(hour, 0, 0, 0);
    dispatch({ type: 'SET_SELECTED_DATE', payload: startTime });
    dispatch({ type: 'OPEN_EVENT_MODAL', payload: null });
  };

  return (
    <div className="week-view">
      {/* Header */}
      <div className="week-header">
        <div className="week-header-time-gutter w-16 flex-shrink-0"></div>
        <div className="week-header-days">
          {weekDays.map((day, index) => {
            const isToday = day.toDateString() === new Date().toDateString();
            return (
              <div key={index} className={`week-header-day ${isToday ? 'today' : ''}`}>
                <div className="week-day-name">
                  {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                </div>
                <div className={`week-day-number ${isToday ? 'bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold' : ''}`}>
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid Container */}
      <div className="week-grid-container">
        <div className="week-grid-time-gutter">
          {hours.map(hour => (
            <div key={hour} className="week-grid-time-slot">
              {hour.toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>

        <div className="week-grid">
          {/* Grid Lines */}
          <div className="week-grid-lines">
            {hours.map(hour => (
              <div
                key={hour}
                className="week-grid-hour-line"
                style={{ top: `${(hour / 24) * 100}%` }}
              />
            ))}
            {weekDays.map((_, index) => (
              <div
                key={index}
                className="week-grid-day-line"
                style={{ left: `${(index / 7) * 100}%` }}
              />
            ))}
          </div>

          {/* Current Time Indicator */}
          {weekDays.some(day => day.toDateString() === new Date().toDateString()) && (
            <div
              className="current-time-indicator"
              style={{ top: `${getCurrentTimePosition()}%` }}
            />
          )}

          {/* Clickable Cells */}
          {weekDays.map((day, dayIndex) => (
            <div
              key={dayIndex}
              className="absolute inset-0"
              style={{
                left: `${(dayIndex / 7) * 100}%`,
                width: `${100 / 7}%`,
              }}
            >
              {hours.map(hour => (
                <div
                  key={hour}
                  className="absolute w-full border-b border-border hover:bg-secondary/20 cursor-pointer"
                  style={{
                    top: `${(hour / 24) * 100}%`,
                    height: `${100 / 24}%`,
                  }}
                  onClick={() => handleCellClick(day, hour)}
                />
              ))}

              {/* Events */}
              {getEventsForDay(day).map(event => {
                const position = getEventPosition(event);
                return (
                  <div
                    key={event.id}
                    className={`calendar-event event-type-${event.type}`}
                    style={{
                      ...position,
                      left: '2px',
                      right: '2px',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({ type: 'OPEN_EVENT_MODAL', payload: event });
                    }}
                  >
                    <div className="calendar-event-title">{event.title}</div>
                    <div className="calendar-event-time">
                      {new Date(event.startTime).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                    {event.location && (
                      <div className="calendar-event-location text-xs opacity-75">
                        {event.location}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
