
import React from 'react';
import { useApp } from '../context/AppContext';

export default function CalendarMonth() {
  const { state, dispatch } = useApp();
  const { selectedDate, events } = state;

  const today = new Date();
  const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const lastDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const calendarDays = [];

  // Add days from previous month
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(firstDayOfMonth);
    date.setDate(date.getDate() - i - 1);
    calendarDays.push({ date, isOtherMonth: true });
  }

  // Add days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
    calendarDays.push({ date, isOtherMonth: false });
  }

  // Add days from next month to complete the grid
  const remainingDays = 42 - calendarDays.length; // 6 weeks * 7 days
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, day);
    calendarDays.push({ date, isOtherMonth: true });
  }

  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === date.toDateString();
    }).slice(0, 3); // Limit to 3 events for display
  };

  const getMoreEventsCount = (date: Date) => {
    const totalEvents = events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === date.toDateString();
    }).length;
    return Math.max(0, totalEvents - 3);
  };

  const handleDayClick = (date: Date) => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: date });
    dispatch({ type: 'SET_CALENDAR_VIEW', payload: 'day' });
  };

  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="month-view">
      {/* Weekday Headers */}
      <div className="month-weekdays">
        {weekdays.map(day => (
          <div key={day} className="month-weekday">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="month-grid">
        {calendarDays.map((dayData, index) => {
          const { date, isOtherMonth } = dayData;
          const isToday = date.toDateString() === today.toDateString();
          const dayEvents = getEventsForDay(date);
          const moreEventsCount = getMoreEventsCount(date);

          return (
            <div
              key={index}
              className={`month-day ${isToday ? 'today' : ''} ${isOtherMonth ? 'other-month' : ''}`}
              onClick={() => handleDayClick(date)}
            >
              <div className="month-day-header">
                <div className={`month-day-number ${isToday ? 'today' : ''}`}>
                  {date.getDate()}
                </div>
              </div>

              <div className="month-day-events">
                {dayEvents.map(event => (
                  <div
                    key={event.id}
                    className={`month-event event-type-${event.type}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({ type: 'OPEN_EVENT_MODAL', payload: event });
                    }}
                  >
                    <div className="month-event-time">
                      {new Date(event.startTime).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                    <div className="month-event-title">{event.title}</div>
                  </div>
                ))}

                {moreEventsCount > 0 && (
                  <div className="month-more-events">
                    +{moreEventsCount} mais
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
