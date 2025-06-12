
import React from 'react';
import { useApp } from '../context/AppContext';

export default function CalendarDay() {
  const { state, dispatch } = useApp();
  const { selectedDate, events } = state;

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getCurrentTimePosition = () => {
    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    return (hour * 60 + minutes) / (24 * 60) * 100;
  };

  const getEventsForDay = () => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === selectedDate.toDateString();
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

  const handleTimeSlotClick = (hour: number) => {
    const startTime = new Date(selectedDate);
    startTime.setHours(hour, 0, 0, 0);
    dispatch({ type: 'SET_SELECTED_DATE', payload: startTime });
    dispatch({ type: 'OPEN_EVENT_MODAL', payload: null });
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <div className="day-view">
      {/* Header */}
      <div className="day-header">
        <h2 className="day-title">
          {selectedDate.toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h2>
      </div>

      {/* Grid Container */}
      <div className="day-grid-container">
        <div className="day-grid-time-gutter">
          {hours.map(hour => (
            <div key={hour} className="day-grid-time-slot">
              {hour.toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>

        <div className="day-grid">
          {/* Grid Lines */}
          <div className="day-grid-lines">
            {hours.map(hour => (
              <div
                key={hour}
                className="day-grid-hour-line"
                style={{ top: `${(hour / 24) * 100}%` }}
              />
            ))}
          </div>

          {/* Current Time Indicator */}
          {isToday && (
            <div
              className="current-time-indicator"
              style={{ top: `${getCurrentTimePosition()}%` }}
            />
          )}

          {/* Clickable Time Slots */}
          {hours.map(hour => (
            <div
              key={hour}
              className="absolute w-full border-b border-border hover:bg-secondary/20 cursor-pointer"
              style={{
                top: `${(hour / 24) * 100}%`,
                height: `${100 / 24}%`,
              }}
              onClick={() => handleTimeSlotClick(hour)}
            />
          ))}

          {/* Events */}
          {getEventsForDay().map(event => {
            const position = getEventPosition(event);
            return (
              <div
                key={event.id}
                className={`calendar-event event-type-${event.type}`}
                style={{
                  ...position,
                  left: '8px',
                  right: '8px',
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
                  })} - {new Date(event.endTime).toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
                {event.location && (
                  <div className="calendar-event-location text-xs opacity-75 mt-1">
                    📍 {event.location}
                  </div>
                )}
                {event.professor && (
                  <div className="calendar-event-professor text-xs opacity-75 italic">
                    Prof. {event.professor}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
