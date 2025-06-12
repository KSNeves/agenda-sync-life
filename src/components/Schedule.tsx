
import React from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, Clock, MapPin, User } from 'lucide-react';

export default function Schedule() {
  const { state } = useApp();
  const { events } = state;

  const today = new Date();
  const upcoming = events
    .filter(event => new Date(event.startTime) >= today)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 10);

  const formatDateTime = (date: Date) => {
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const getEventTypeLabel = (type: string) => {
    const types = {
      class: 'Aula',
      study: 'Estudo',
      exam: 'Prova',
      personal: 'Pessoal',
      other: 'Outro',
    };
    return types[type as keyof typeof types] || 'Outro';
  };

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <h1 className="text-2xl font-bold">Agendamentos</h1>
      </div>

      <div className="schedule-content">
        {upcoming.length === 0 ? (
          <div className="empty-message">
            Nenhum agendamento próximo encontrado.
          </div>
        ) : (
          <div className="space-y-4">
            {upcoming.map(event => {
              const { date, time } = formatDateTime(new Date(event.startTime));
              const endTime = formatDateTime(new Date(event.endTime)).time;
              
              return (
                <div
                  key={event.id}
                  className={`bg-card p-6 rounded-lg border-l-4 hover:shadow-lg transition-shadow event-type-${event.type}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold">{event.title}</h3>
                    <span className="text-sm bg-secondary px-2 py-1 rounded">
                      {getEventTypeLabel(event.type)}
                    </span>
                  </div>

                  {event.description && (
                    <p className="text-muted-foreground mb-3">{event.description}</p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-muted-foreground" />
                      <span>{date}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-muted-foreground" />
                      <span>{time} - {endTime}</span>
                    </div>

                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-muted-foreground" />
                        <span>{event.location}</span>
                      </div>
                    )}

                    {event.professor && (
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-muted-foreground" />
                        <span>Prof. {event.professor}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
