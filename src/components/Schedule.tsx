

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import CalendarMonth from './CalendarMonth';
import CalendarDay from './CalendarDay';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../context/LanguageContext';
import { ScrollArea } from './ui/scroll-area';

export default function Schedule() {
  const { state, dispatch } = useApp();
  const { events, selectedDate } = state;
  const { t } = useTranslation();
  const { language } = useLanguage();

  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');

  // Get the actual locale based on the current language
  const getLocale = () => {
    switch (language) {
      case 'pt':
        return 'pt-BR';
      case 'en':
        return 'en-US';
      case 'es':
        return 'es-ES';
      default:
        return 'pt-BR';
    }
  };

  // Atualizar hora atual a cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Atualiza a cada minuto

    return () => clearInterval(interval);
  }, []);

  // Navegação da semana
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    }
    setCurrentWeek(newDate);
    dispatch({ type: 'SET_SELECTED_DATE', payload: newDate });
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentWeek(today);
    dispatch({ type: 'SET_SELECTED_DATE', payload: today });
  };

  // Calcular os dias da semana
  const getWeekDays = () => {
    const start = new Date(currentWeek);
    start.setDate(start.getDate() - start.getDay()); // Começar no domingo
    
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      return day;
    });
  };

  const weekDays = getWeekDays();
  const hours = Array.from({ length: 19 }, (_, i) => i + 5); // 5:00 às 23:00

  // Array com traduções dos dias da semana abreviados
  const dayNamesShort = [
    t('weekdays.sun'),
    t('weekdays.mon'), 
    t('weekdays.tue'),
    t('weekdays.wed'),
    t('weekdays.thu'),
    t('weekdays.fri'),
    t('weekdays.sat')
  ];

  // Formatar título da semana com tradução - using proper locale
  const getWeekTitle = () => {
    const locale = getLocale();
    
    if (viewMode === 'month') {
      return currentWeek.toLocaleDateString(locale, { year: 'numeric', month: 'long' });
    } else if (viewMode === 'day') {
      return currentWeek.toLocaleDateString(locale, { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } else { // viewMode === 'week'
      const start = weekDays[0];
      const end = weekDays[6];
      const monthName = end.toLocaleDateString(locale, { month: 'long' });
      return `${start.getDate()} - ${end.getDate()} de ${monthName} de ${end.getFullYear()}`;
    }
  };

  // Obter eventos para um dia específico
  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === day.toDateString();
    });
  };

  // Calcular posição do evento com base no horário exato
  const getEventPosition = (event: any) => {
    const startTime = new Date(event.startTime);
    const endTime = new Date(event.endTime);
    
    // Converter para minutos desde 5:00
    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
    const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();
    const dayStartMinutes = 5 * 60; // 5:00 em minutos
    const hourHeightPx = 40; // Reduzido para 40 pixels para mobile
    
    // Calcular posição em pixels
    const topPx = ((startMinutes - dayStartMinutes) / 60) * hourHeightPx;
    const heightPx = ((endMinutes - startMinutes) / 60) * hourHeightPx;
    
    return {
      top: `${Math.max(0, topPx)}px`,
      height: `${Math.max(4, heightPx)}px`,
    };
  };

  // Calcular posição da linha de hora atual
  const getCurrentTimePosition = () => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const dayStartMinutes = 5 * 60; // 5:00 em minutos
    const dayEndMinutes = 23 * 60; // 23:00 em minutos
    const hourHeightPx = 40; // Reduzido para 40 pixels para mobile
    
    // Só mostrar a linha se estiver dentro do horário visível
    if (currentMinutes < dayStartMinutes || currentMinutes > dayEndMinutes) {
      return null;
    }
    
    const topPx = ((currentMinutes - dayStartMinutes) / 60) * hourHeightPx;
    return topPx;
  };

  // Função para obter a cor do evento
  const getEventStyle = (event: any) => {
    const colorMap: { [key: string]: string } = {
      blue: '#3b82f6',
      green: '#10b981',
      red: '#ef4444',
      purple: '#8b5cf6',
      orange: '#f97316',
      pink: '#ec4899',
      yellow: '#eab308',
      gray: '#6b7280',
    };

    const backgroundColor = colorMap[event.customColor] || colorMap.blue;
    
    return {
      backgroundColor,
      borderColor: backgroundColor,
      boxShadow: `0 4px 14px 0 ${backgroundColor}40`,
    };
  };

  const createEvent = () => {
    dispatch({ type: 'OPEN_EVENT_MODAL', payload: null });
  };

  const currentTimePosition = getCurrentTimePosition();

  // Render header comum para todos os modos
  const renderHeader = () => (
    <div className="bg-card/50 backdrop-blur-sm border-b border-border/50 p-2 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 w-full md:w-auto">
          <button
            onClick={createEvent}
            className="bg-primary text-primary-foreground px-3 py-1.5 md:px-4 md:py-2 rounded-lg flex items-center gap-1 md:gap-2 hover:bg-primary/90 transition-colors text-sm md:text-sm min-w-[140px] md:min-w-0"
          >
            <Plus size={14} className="md:hidden" />
            <Plus size={14} className="hidden md:block" />
            <span>{t('schedule.createEvent')}</span>
          </button>
          
          <div className="flex items-center gap-1 md:gap-2 w-full md:w-auto">
            <button
              onClick={goToToday}
              className="px-2 py-1 md:px-4 md:py-2 text-foreground hover:bg-secondary/50 rounded-lg transition-colors text-xs md:text-sm"
            >
              {t('schedule.today')}
            </button>
            <div className="flex items-center gap-0.5 md:gap-1">
              <button
                onClick={() => navigateWeek('prev')}
                className="p-1 md:p-2 hover:bg-secondary/50 rounded-lg transition-colors"
              >
                <ChevronLeft size={14} className="md:hidden" />
                <ChevronLeft size={18} className="hidden md:block" />
              </button>
              <button
                onClick={() => navigateWeek('next')}
                className="p-1 md:p-2 hover:bg-secondary/50 rounded-lg transition-colors"
              >
                <ChevronRight size={14} className="md:hidden" />
                <ChevronRight size={18} className="hidden md:block" />
              </button>
            </div>
          </div>
          
          <h2 className="text-sm md:text-xl font-semibold text-foreground truncate">
            {getWeekTitle()}
          </h2>
        </div>

        <div className="flex border border-border/50 rounded-lg overflow-hidden bg-card/30 w-full md:w-auto">
          <button 
            onClick={() => setViewMode('day')}
            className={`px-2 py-1 md:px-4 md:py-2 text-xs md:text-sm flex-1 md:flex-none ${viewMode === 'day' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50'} transition-colors`}
          >
            {t('schedule.day')}
          </button>
          <button 
            onClick={() => setViewMode('week')}
            className={`px-2 py-1 md:px-4 md:py-2 text-xs md:text-sm flex-1 md:flex-none ${viewMode === 'week' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50'} transition-colors`}
          >
            {t('schedule.week')}
          </button>
          <button 
            onClick={() => setViewMode('month')}
            className={`px-2 py-1 md:px-4 md:py-2 text-xs md:text-sm flex-1 md:flex-none ${viewMode === 'month' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50'} transition-colors`}
          >
            {t('schedule.month')}
          </button>
        </div>
      </div>
    </div>
  );

  // Se estiver no modo mês, renderizar o componente de mês
  if (viewMode === 'month') {
    return (
      <div className="flex h-screen bg-background">
        <div className="flex-1 flex flex-col">
          {renderHeader()}
          <CalendarMonth dayNamesShort={dayNamesShort} />
        </div>
      </div>
    );
  }

  // Se estiver no modo dia, renderizar o componente de dia
  if (viewMode === 'day') {
    return (
      <div className="flex h-screen bg-background">
        <div className="flex-1 flex flex-col">
          {renderHeader()}

          {/* Visualização do Dia */}
          <ScrollArea className="flex-1">
            <div className="relative min-w-[320px]">
              {/* Linha da hora atual */}
              {currentTimePosition !== null && (
                <div
                  className="absolute left-0 right-0 z-30 border-t-2 border-red-500 shadow-lg"
                  style={{
                    top: `${currentTimePosition}px`,
                  }}
                >
                  <div className="absolute -left-2 -top-2 w-4 h-4 bg-red-500 rounded-full shadow-lg"></div>
                  <div className="absolute right-2 -top-3 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg">
                    {currentTime.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              )}

              {/* Container para eventos */}
              <div className="absolute inset-0 z-10 ml-6 md:ml-20">
                {getEventsForDay(currentWeek).map(event => {
                  const position = getEventPosition(event);
                  const eventStyle = getEventStyle(event);
                  const startTime = new Date(event.startTime);
                  const endTime = new Date(event.endTime);
                  
                  return (
                    <div
                      key={event.id}
                      className="absolute left-0.5 right-0.5 md:left-2 md:right-2 rounded-lg p-1 md:p-2 text-xs font-medium cursor-pointer hover:shadow-xl transition-all duration-200 border-2 z-20"
                      style={{
                        ...position,
                        ...eventStyle,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch({ type: 'OPEN_EVENT_MODAL', payload: event });
                      }}
                    >
                      <div className="truncate font-semibold text-white text-xs">{event.title}</div>
                      <div className="truncate opacity-90 text-xs text-white">
                        {startTime.toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })} - {endTime.toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Grade de linhas de hora */}
              {hours.map((hour) => (
                <div key={hour} className="flex border-b border-border/20 h-10 md:h-16">
                  {/* Coluna de Horário */}
                  <div className="w-6 md:w-20 flex items-start justify-end pr-0.5 md:pr-2 pt-0 text-muted-foreground border-r border-border/50">
                    <span className="-mt-2 text-[10px] md:text-sm">
                      {hour.toString().padStart(2, '0')}:00
                    </span>
                  </div>
                  
                  {/* Área do Dia */}
                  <div
                    className="flex-1 hover:bg-secondary/20 cursor-pointer transition-colors"
                    onClick={() => {
                      const startTime = new Date(currentWeek);
                      startTime.setHours(hour, 0, 0, 0);
                      dispatch({ type: 'SET_SELECTED_DATE', payload: startTime });
                      dispatch({ type: 'OPEN_EVENT_MODAL', payload: null });
                    }}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  }

  // Visualização da Semana
  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col">
        {renderHeader()}

        {/* Grade do Calendário */}
        <ScrollArea className="flex-1">
          <div className="overflow-x-auto md:overflow-x-visible">
            {/* Header dos Dias */}
            <div className="grid grid-cols-8 border-b border-border/50 bg-card/30 min-w-[280px] md:min-w-[700px]">
              <div className="w-6 md:w-20"></div>
              {weekDays.map((day, index) => {
                const isToday = day.toDateString() === new Date().toDateString();
                
                return (
                  <div key={index} className={`p-1 md:p-4 text-center border-r border-border/50 last:border-r-0 ${isToday ? 'bg-blue-50' : ''}`}>
                    <div className={`text-xs font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-muted-foreground'}`}>
                      {dayNamesShort[index]}
                    </div>
                    <div className={`text-sm md:text-2xl font-semibold ${isToday ? 'text-blue-600 bg-blue-100 rounded-full w-5 h-5 md:w-10 md:h-10 flex items-center justify-center mx-auto text-xs md:text-xl' : 'text-foreground'}`}>
                      {day.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Grade de Horários */}
            <div className="relative min-w-[280px] md:min-w-[700px]">
              {/* Linha da hora atual */}
              {currentTimePosition !== null && (
                <div
                  className="absolute left-0 right-0 z-30 border-t-2 border-red-500 shadow-lg"
                  style={{
                    top: `${currentTimePosition}px`,
                  }}
                >
                  <div className="absolute -left-2 -top-2 w-4 h-4 bg-red-500 rounded-full shadow-lg"></div>
                  <div className="absolute right-2 -top-3 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg">
                    {currentTime.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              )}

              {/* Container para eventos */}
              <div className="absolute inset-0 z-10 grid grid-cols-8">
                <div className="w-6 md:w-20"></div>
                {weekDays.map((day, dayIndex) => {
                  const dayEvents = getEventsForDay(day);
                  const isToday = day.toDateString() === new Date().toDateString();
                  
                  return (
                    <div key={dayIndex} className={`relative ${isToday ? 'bg-blue-50/30' : ''}`}>
                      {dayEvents.map(event => {
                        const position = getEventPosition(event);
                        const eventStyle = getEventStyle(event);
                        const startTime = new Date(event.startTime);
                        const endTime = new Date(event.endTime);
                        
                        return (
                          <div
                            key={event.id}
                            className="absolute left-0.5 right-0.5 md:left-1 md:right-1 rounded-lg p-0.5 md:p-2 text-xs font-medium cursor-pointer hover:shadow-xl transition-all duration-200 border-2 z-20"
                            style={{
                              ...position,
                              ...eventStyle,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch({ type: 'OPEN_EVENT_MODAL', payload: event });
                            }}
                          >
                            <div className="truncate font-semibold text-white text-xs">{event.title}</div>
                            <div className="truncate opacity-90 text-xs text-white hidden md:block">
                              {startTime.toLocaleTimeString('pt-BR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })} - {endTime.toLocaleTimeString('pt-BR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* Grade de linhas de hora */}
              {hours.map((hour, hourIndex) => (
                <div key={hour} className="grid grid-cols-8 border-b border-border/20 h-10 md:h-16">
                  {/* Coluna de Horário */}
                  <div className="w-6 md:w-20 flex items-start justify-end pr-0.5 md:pr-2 pt-0 text-muted-foreground border-r border-border/50">
                    <span className="-mt-2 text-[10px] md:text-sm">
                      {hour.toString().padStart(2, '0')}:00
                    </span>
                  </div>
                  
                  {/* Colunas dos Dias */}
                  {weekDays.map((day, dayIndex) => {
                    const isToday = day.toDateString() === new Date().toDateString();
                    return (
                      <div
                        key={dayIndex}
                        className={`relative border-r border-border/20 last:border-r-0 hover:bg-secondary/20 cursor-pointer transition-colors ${isToday ? 'bg-blue-50/20' : ''}`}
                        onClick={() => {
                          const startTime = new Date(day);
                          startTime.setHours(hour, 0, 0, 0);
                          dispatch({ type: 'SET_SELECTED_DATE', payload: startTime });
                          dispatch({ type: 'OPEN_EVENT_MODAL', payload: null });
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

