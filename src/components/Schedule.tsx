import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function Schedule() {
  const { state, dispatch } = useApp();
  const { events, selectedDate } = state;

  const [currentWeek, setCurrentWeek] = useState(new Date());

  // Navegação da semana
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newDate);
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
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
  const hours = Array.from({ length: 15 }, (_, i) => i + 6); // 6:00 às 20:00

  // Formatar título da semana
  const getWeekTitle = () => {
    const start = weekDays[0];
    const end = weekDays[6];
    return `${start.getDate()} - ${end.getDate()} de ${end.toLocaleDateString('pt-BR', { month: 'long' })} de ${end.getFullYear()}`;
  };

  // Obter eventos para um dia específico
  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === day.toDateString();
    });
  };

  // Calcular posição do evento
  const getEventPosition = (event: any) => {
    const startTime = new Date(event.startTime);
    const endTime = new Date(event.endTime);
    const startHour = startTime.getHours() + startTime.getMinutes() / 60;
    const endHour = endTime.getHours() + endTime.getMinutes() / 60;
    
    // Ajustar para começar às 6:00
    const topPosition = ((startHour - 6) / 14) * 100; // 14 horas (6 às 20)
    const height = ((endHour - startHour) / 14) * 100;
    
    return {
      top: `${Math.max(0, topPosition)}%`,
      height: `${Math.max(5, height)}%`, // Altura mínima de 5%
    };
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

  return (
    <div className="flex h-screen bg-background">
      {/* Área Principal - Sem Sidebar */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
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
              <button className="px-4 py-2 text-muted-foreground hover:bg-accent/50 transition-colors">
                Dia
              </button>
              <button className="px-4 py-2 bg-accent text-accent-foreground">
                Semana
              </button>
              <button className="px-4 py-2 text-muted-foreground hover:bg-accent/50 transition-colors">
                Mês
              </button>
            </div>
          </div>
        </div>

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
              {hours.map((hour, hourIndex) => (
                <div key={hour} className="grid grid-cols-8 border-b border-border/20">
                  {/* Coluna de Horário */}
                  <div className="w-20 p-2 text-right text-sm text-muted-foreground border-r border-border/50">
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                  
                  {/* Colunas dos Dias */}
                  {weekDays.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className="relative h-16 border-r border-border/20 last:border-r-0 hover:bg-secondary/20 cursor-pointer transition-colors"
                      onClick={() => {
                        const startTime = new Date(day);
                        startTime.setHours(hour, 0, 0, 0);
                        dispatch({ type: 'SET_SELECTED_DATE', payload: startTime });
                        dispatch({ type: 'OPEN_EVENT_MODAL', payload: null });
                      }}
                    >
                      {/* Eventos */}
                      {getEventsForDay(day).map(event => {
                        const eventStart = new Date(event.startTime);
                        const eventHour = eventStart.getHours();
                        
                        if (eventHour === hour) {
                          const position = getEventPosition(event);
                          const eventStyle = getEventStyle(event);
                          return (
                            <div
                              key={event.id}
                              className="absolute left-1 right-1 rounded-lg p-2 text-xs font-medium cursor-pointer hover:shadow-xl transition-all duration-200 z-10 border-2"
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
                                {eventStart.toLocaleTimeString('pt-BR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
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
