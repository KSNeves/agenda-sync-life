
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import CalendarMonth from './CalendarMonth';
import CalendarDay from './CalendarDay';

export default function Schedule() {
  const { state, dispatch } = useApp();
  const { events, selectedDate } = state;

  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');

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

  // Formatar título da semana
  const getWeekTitle = () => {
    if (viewMode === 'month') {
      return currentWeek.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' });
    } else if (viewMode === 'day') {
      return currentWeek.toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } else { // viewMode === 'week'
      const start = weekDays[0];
      const end = weekDays[6];
      return `${start.getDate()} - ${end.getDate()} de ${end.toLocaleDateString('pt-BR', { month: 'long' })} de ${end.getFullYear()}`;
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
    const hourHeightPx = 64; // altura de cada linha de hora em pixels
    
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
    const hourHeightPx = 64;
    
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
    <div className="bg-card/50 backdrop-blur-sm border-b border-border/50 p-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={createEvent}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} />
            Criar Evento
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
          >
            Hoje
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            {getWeekTitle()}
          </h2>
        </div>

        <div className="flex border border-border/50 rounded-lg overflow-hidden bg-card/30">
          <button 
            onClick={() => setViewMode('day')}
            className={`px-4 py-2 ${viewMode === 'day' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50'} transition-colors`}
          >
            Dia
          </button>
          <button 
            onClick={() => setViewMode('week')}
            className={`px-4 py-2 ${viewMode === 'week' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50'} transition-colors`}
          >
            Semana
          </button>
          <button 
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 ${viewMode === 'month' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50'} transition-colors`}
          >
            Mês
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
          <CalendarMonth />
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
          <div className="flex-1 overflow-auto">
            <div className="relative">
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
              <div className="absolute inset-0 z-10 ml-20">
                {getEventsForDay(currentWeek).map(event => {
                  const position = getEventPosition(event);
                  const eventStyle = getEventStyle(event);
                  const startTime = new Date(event.startTime);
                  const endTime = new Date(event.endTime);
                  
                  return (
                    <div
                      key={event.id}
                      className="absolute left-2 right-2 rounded-lg p-2 text-xs font-medium cursor-pointer hover:shadow-xl transition-all duration-200 border-2 z-20"
                      style={{
                        ...position,
                        ...eventStyle,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch({ type: 'OPEN_EVENT_MODAL', payload: event });
                      }}
                    >
                      <div className="truncate font-semibold text-white">{event.title}</div>
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
                <div key={hour} className="flex border-b border-border/20 h-16">
                  {/* Coluna de Horário */}
                  <div className="w-20 flex items-start justify-end pr-2 pt-0 text-sm text-muted-foreground border-r border-border/50">
                    <span className="-mt-2">
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
          </div>
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
        <div className="flex-1 overflow-auto">
          <div className="min-w-[800px]">
            {/* Header dos Dias */}
            <div className="grid grid-cols-8 border-b border-border/50 bg-card/30">
              <div className="w-20"></div>
              {weekDays.map((day, index) => {
                const dayNames = ['DOM.', 'SEG.', 'TER.', 'QUA.', 'QUI.', 'SEX.', 'SÁB.'];
                const isToday = day.toDateString() === new Date().toDateString();
                
                return (
                  <div key={index} className="p-4 text-center border-r border-border/50 last:border-r-0">
                    <div className="text-xs text-muted-foreground font-medium mb-1">
                      {dayNames[index]}
                    </div>
                    <div className={`text-2xl font-semibold ${isToday ? 'text-primary' : 'text-foreground'}`}>
                      {day.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Grade de Horários */}
            <div className="relative">
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
                <div className="w-20"></div>
                {weekDays.map((day, dayIndex) => {
                  const dayEvents = getEventsForDay(day);
                  
                  return (
                    <div key={dayIndex} className="relative">
                      {dayEvents.map(event => {
                        const position = getEventPosition(event);
                        const eventStyle = getEventStyle(event);
                        const startTime = new Date(event.startTime);
                        const endTime = new Date(event.endTime);
                        
                        return (
                          <div
                            key={event.id}
                            className="absolute left-1 right-1 rounded-lg p-2 text-xs font-medium cursor-pointer hover:shadow-xl transition-all duration-200 border-2 z-20"
                            style={{
                              ...position,
                              ...eventStyle,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch({ type: 'OPEN_EVENT_MODAL', payload: event });
                            }}
                          >
                            <div className="truncate font-semibold text-white">{event.title}</div>
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
                  );
                })}
              </div>

              {/* Grade de linhas de hora */}
              {hours.map((hour, hourIndex) => (
                <div key={hour} className="grid grid-cols-8 border-b border-border/20 h-16">
                  {/* Coluna de Horário */}
                  <div className="w-20 flex items-start justify-end pr-2 pt-0 text-sm text-muted-foreground border-r border-border/50">
                    <span className="-mt-2">
                      {hour.toString().padStart(2, '0')}:00
                    </span>
                  </div>
                  
                  {/* Colunas dos Dias */}
                  {weekDays.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className="relative border-r border-border/20 last:border-r-0 hover:bg-secondary/20 cursor-pointer transition-colors"
                      onClick={() => {
                        const startTime = new Date(day);
                        startTime.setHours(hour, 0, 0, 0);
                        dispatch({ type: 'SET_SELECTED_DATE', payload: startTime });
                        dispatch({ type: 'OPEN_EVENT_MODAL', payload: null });
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
