
import React from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarMonthProps {
  dayNamesShort: string[];
}

export default function CalendarMonth({ dayNamesShort }: CalendarMonthProps) {
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
    });
  };

  const handleDayClick = (date: Date) => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: date });
    dispatch({ type: 'SET_CALENDAR_VIEW', payload: 'day' });
  };

  const weekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  return (
    <div className="flex-1 overflow-auto">
      <div className="w-full">
        {/* Header dos Dias */}
        <div className="grid grid-cols-7 border-b border-border/50 bg-card/30">
          {dayNamesShort.map((dayName, index) => (
            <div key={index} className="p-2 md:p-4 text-center border-r border-border/50 last:border-r-0">
              <div className="text-xs font-medium text-muted-foreground">
                {dayName}
              </div>
            </div>
          ))}
        </div>

        {/* Grade do calendário */}
        <div className="grid grid-cols-7 flex-1">
          {calendarDays.map((dayData, index) => {
            const { date, isOtherMonth } = dayData;
            const isToday = date.toDateString() === today.toDateString();
            const dayEvents = getEventsForDay(date);
            const hasEvents = dayEvents.length > 0;

            return (
              <div
                key={index}
                className={`
                  min-h-[80px] md:min-h-[120px] p-1 md:p-2 border-r border-b border-border/20 last:border-r-0 
                  hover:bg-secondary/20 cursor-pointer transition-colors relative
                  ${isOtherMonth ? 'bg-background text-muted-foreground' : 'bg-card/10'}
                `}
                onClick={() => handleDayClick(date)}
              >
                {/* Número do dia */}
                <div className="flex justify-start mb-1">
                  <span 
                    className={`
                      text-sm md:text-lg font-medium
                      ${isToday 
                        ? 'bg-primary text-primary-foreground w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-base' 
                        : isOtherMonth 
                          ? 'text-muted-foreground' 
                          : 'text-foreground'
                      }
                    `}
                  >
                    {date.getDate()}
                  </span>
                </div>

                {/* Eventos do dia */}
                <div className="space-y-0.5 md:space-y-1">
                  {dayEvents.slice(0, 2).map(event => {
                    const startTime = new Date(event.startTime);
                    const colorMap: { [key: string]: string } = {
                      blue: 'bg-blue-500',
                      green: 'bg-green-500',
                      red: 'bg-red-500',
                      purple: 'bg-purple-500',
                      orange: 'bg-orange-500',
                      pink: 'bg-pink-500',
                      yellow: 'bg-yellow-500',
                      gray: 'bg-gray-500',
                    };
                    const bgColor = colorMap[event.customColor || 'blue'] || 'bg-blue-500';

                    return (
                      <div
                        key={event.id}
                        className={`
                          ${bgColor} text-white text-xs p-0.5 md:p-1 rounded truncate
                          hover:opacity-80 cursor-pointer
                        `}
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch({ type: 'OPEN_EVENT_MODAL', payload: event });
                        }}
                      >
                        <div className="font-medium truncate text-xs">{event.title}</div>
                        <div className="text-xs opacity-90 hidden md:block">
                          {startTime.toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {dayEvents.length > 2 && (
                    <div className="text-xs text-muted-foreground font-medium">
                      +{dayEvents.length - 2}
                    </div>
                  )}
                </div>

                {/* Indicador de eventos quando não há espaço */}
                {hasEvents && dayEvents.length <= 2 && (
                  <div className="absolute bottom-1 right-1">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-primary rounded-full"></div>
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
