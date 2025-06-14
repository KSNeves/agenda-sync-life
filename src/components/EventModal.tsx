
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CalendarEvent } from '../types';
import { X } from 'lucide-react';

const eventColors = [
  { name: 'Azul', value: 'blue', bg: 'bg-blue-500', preview: '#3b82f6' },
  { name: 'Verde', value: 'green', bg: 'bg-green-500', preview: '#10b981' },
  { name: 'Vermelho', value: 'red', bg: 'bg-red-500', preview: '#ef4444' },
  { name: 'Roxo', value: 'purple', bg: 'bg-purple-500', preview: '#8b5cf6' },
  { name: 'Laranja', value: 'orange', bg: 'bg-orange-500', preview: '#f97316' },
  { name: 'Rosa', value: 'pink', bg: 'bg-pink-500', preview: '#ec4899' },
  { name: 'Amarelo', value: 'yellow', bg: 'bg-yellow-500', preview: '#eab308' },
  { name: 'Cinza', value: 'gray', bg: 'bg-gray-500', preview: '#6b7280' },
];

export default function EventModal() {
  const { state, dispatch } = useApp();
  const { isEventModalOpen, selectedEvent } = state;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    type: 'other' as CalendarEvent['type'],
    location: '',
    professor: '',
    customColor: 'blue',
    recurrence: {
      type: 'none' as 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly',
      weekdays: [] as number[],
    },
  });

  useEffect(() => {
    if (selectedEvent) {
      setFormData({
        title: selectedEvent.title,
        description: selectedEvent.description || '',
        startTime: new Date(selectedEvent.startTime).toISOString().slice(0, 16),
        endTime: new Date(selectedEvent.endTime).toISOString().slice(0, 16),
        type: selectedEvent.type,
        location: selectedEvent.location || '',
        professor: selectedEvent.professor || '',
        customColor: selectedEvent.customColor || 'blue',
        recurrence: {
          type: selectedEvent.recurrence?.type || 'none',
          weekdays: selectedEvent.recurrence?.weekdays || [],
        },
      });
    } else {
      // New event - set default times
      const now = new Date();
      const startTime = new Date(state.selectedDate);
      startTime.setHours(now.getHours(), 0, 0, 0);
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);

      setFormData({
        title: '',
        description: '',
        startTime: startTime.toISOString().slice(0, 16),
        endTime: endTime.toISOString().slice(0, 16),
        type: 'other',
        location: '',
        professor: '',
        customColor: 'blue',
        recurrence: { type: 'none', weekdays: [] },
      });
    }
  }, [selectedEvent, state.selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventData: CalendarEvent = {
      id: selectedEvent?.id || Date.now().toString(),
      title: formData.title,
      description: formData.description,
      startTime: new Date(formData.startTime),
      endTime: new Date(formData.endTime),
      type: formData.type,
      location: formData.location,
      professor: formData.professor,
      customColor: formData.customColor,
      recurrence: formData.recurrence.type !== 'none' ? formData.recurrence : undefined,
    };

    if (selectedEvent) {
      dispatch({ type: 'UPDATE_EVENT', payload: eventData });
    } else {
      dispatch({ type: 'ADD_EVENT', payload: eventData });
    }

    handleClose();
  };

  const handleDelete = () => {
    if (selectedEvent) {
      dispatch({ type: 'DELETE_EVENT', payload: selectedEvent.id });
      handleClose();
    }
  };

  const handleClose = () => {
    dispatch({ type: 'CLOSE_EVENT_MODAL' });
  };

  const toggleWeekday = (day: number) => {
    setFormData(prev => ({
      ...prev,
      recurrence: {
        ...prev.recurrence,
        weekdays: prev.recurrence.weekdays.includes(day)
          ? prev.recurrence.weekdays.filter(d => d !== day)
          : [...prev.recurrence.weekdays, day],
      },
    }));
  };

  if (!isEventModalOpen) return null;

  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="event-modal-overlay" onClick={handleClose}>
      <div className="event-modal" onClick={(e) => e.stopPropagation()}>
        <div className="event-modal-header">
          <h2 className="text-xl font-bold">
            {selectedEvent ? 'Editar Evento' : 'Criar Evento'}
          </h2>
          <button onClick={handleClose} className="close-button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="event-modal-content">
          <div className="form-group">
            <label>Título</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Data/Hora de Início</label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Data/Hora de Fim</label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Tipo</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as CalendarEvent['type'] }))}
              >
                <option value="class">Aula</option>
                <option value="study">Estudo</option>
                <option value="exam">Prova</option>
                <option value="personal">Pessoal</option>
                <option value="other">Outro</option>
              </select>
            </div>
            <div className="form-group">
              <label>Local</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
          </div>

          {formData.type === 'class' && (
            <div className="form-group">
              <label>Professor</label>
              <input
                type="text"
                value={formData.professor}
                onChange={(e) => setFormData(prev => ({ ...prev, professor: e.target.value }))}
              />
            </div>
          )}

          <div className="form-group">
            <label>Cor do Evento</label>
            <div className="color-selector">
              {eventColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, customColor: color.value }))}
                  className={`color-option ${color.bg} ${
                    formData.customColor === color.value ? 'selected' : ''
                  }`}
                  title={color.name}
                  style={{ backgroundColor: color.preview }}
                />
              ))}
            </div>
          </div>

          <div className="recurrence-options">
            <div className="form-group">
              <label>Recorrência</label>
              <select
                value={formData.recurrence.type}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  recurrence: { ...prev.recurrence, type: e.target.value as any }
                }))}
              >
                <option value="none">Não repetir</option>
                <option value="daily">Diariamente</option>
                <option value="weekly">Semanalmente</option>
                <option value="monthly">Mensalmente</option>
                <option value="yearly">Anualmente</option>
              </select>
            </div>

            {formData.recurrence.type === 'weekly' && (
              <div className="form-group">
                <label>Dias da Semana</label>
                <div className="weekday-selector">
                  {weekdays.map((day, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => toggleWeekday(index)}
                      className={`weekday-button ${
                        formData.recurrence.weekdays.includes(index) ? 'selected' : ''
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="event-modal-footer">
            {selectedEvent && (
              <button
                type="button"
                onClick={handleDelete}
                className="delete-button"
              >
                Excluir
              </button>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="cancel-button"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="save-button"
              >
                {selectedEvent ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
