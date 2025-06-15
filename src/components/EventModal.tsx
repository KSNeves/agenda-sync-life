import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useSupabaseEvents } from '../context/SupabaseEventsContext';
import { useSupabaseRevisions } from '../context/SupabaseRevisionsContext';
import { CalendarEvent, RevisionItem } from '../types';
import { X } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { useTranslation } from '../hooks/useTranslation';

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
  const { addEvent, updateEvent, deleteEvent, deleteRecurringEvents } = useSupabaseEvents();
  const { addRevisionItem } = useSupabaseRevisions();
  const { t } = useTranslation();
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

  const [addToRevision, setAddToRevision] = useState(false);

  useEffect(() => {
    if (selectedEvent) {
      const formatDateTimeLocal = (timestamp: number) => {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      setFormData({
        title: selectedEvent.title,
        description: selectedEvent.description || '',
        startTime: formatDateTimeLocal(selectedEvent.startTime),
        endTime: formatDateTimeLocal(selectedEvent.endTime),
        type: selectedEvent.type,
        location: selectedEvent.location || '',
        professor: selectedEvent.professor || '',
        customColor: selectedEvent.customColor || 'blue',
        recurrence: {
          type: selectedEvent.recurrence?.type || 'none',
          weekdays: selectedEvent.recurrence?.weekdays || [],
        },
      });
      setAddToRevision(false);
    } else {
      const now = new Date();
      const startTime = new Date(state.selectedDate);
      startTime.setHours(now.getHours(), 0, 0, 0);
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);

      const formatDateTimeLocal = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      setFormData({
        title: '',
        description: '',
        startTime: formatDateTimeLocal(startTime),
        endTime: formatDateTimeLocal(endTime),
        type: 'other',
        location: '',
        professor: '',
        customColor: 'blue',
        recurrence: { type: 'none', weekdays: [] },
      });
      setAddToRevision(false);
    }
  }, [selectedEvent, state.selectedDate]);

  const createRecurringEvents = (baseEvent: CalendarEvent) => {
    const events: CalendarEvent[] = [baseEvent];
    const startDate = new Date(baseEvent.startTime);
    const endDate = new Date(baseEvent.endTime);
    const eventDuration = endDate.getTime() - startDate.getTime();

    if (formData.recurrence.type === 'daily') {
      for (let i = 1; i <= 30; i++) {
        const newStart = new Date(startDate);
        newStart.setDate(startDate.getDate() + i);
        const newEnd = new Date(newStart.getTime() + eventDuration);

        events.push({
          ...baseEvent,
          id: `${baseEvent.id}_${i}`,
          startTime: newStart.getTime(),
          endTime: newEnd.getTime(),
        });
      }
    } else if (formData.recurrence.type === 'weekly') {
      if (formData.recurrence.weekdays.length > 0) {
        for (let week = 0; week < 12; week++) {
          formData.recurrence.weekdays.forEach(weekday => {
            if (week === 0 && weekday === startDate.getDay()) {
              return;
            }

            const newStart = new Date(startDate);
            newStart.setDate(startDate.getDate() - startDate.getDay() + weekday + (week * 7));
            const newEnd = new Date(newStart.getTime() + eventDuration);

            if (newStart >= new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())) {
              events.push({
                ...baseEvent,
                id: `${baseEvent.id}_${week}_${weekday}`,
                startTime: newStart.getTime(),
                endTime: newEnd.getTime(),
              });
            }
          });
        }
      } else {
        for (let i = 1; i <= 12; i++) {
          const newStart = new Date(startDate);
          newStart.setDate(startDate.getDate() + (i * 7));
          const newEnd = new Date(newStart.getTime() + eventDuration);

          events.push({
            ...baseEvent,
            id: `${baseEvent.id}_${i}`,
            startTime: newStart.getTime(),
            endTime: newEnd.getTime(),
          });
        }
      }
    }

    return events;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventData: CalendarEvent = {
      id: selectedEvent?.id || Date.now().toString(),
      title: formData.title,
      description: formData.description,
      startTime: new Date(formData.startTime).getTime(),
      endTime: new Date(formData.endTime).getTime(),
      type: formData.type,
      location: formData.location,
      professor: formData.professor,
      customColor: formData.customColor,
      recurrence: formData.recurrence.type !== 'none' ? formData.recurrence : undefined,
    };

    if (selectedEvent) {
      updateEvent(eventData);
    } else {
      if (formData.recurrence.type !== 'none') {
        const recurringEvents = createRecurringEvents(eventData);
        recurringEvents.forEach(event => {
          addEvent(event);
        });
      } else {
        addEvent(eventData);
      }
    }

    if (addToRevision) {
      const eventStartDate = new Date(formData.startTime);
      eventStartDate.setHours(0, 0, 0, 0);

      const revisionContent = [
        formData.title,
        formData.description && `${t('event.description')}: ${formData.description}`,
        formData.location && `${t('event.location')}: ${formData.location}`,
        formData.professor && `${t('event.professor')}: ${formData.professor}`,
      ].filter(Boolean).join('\n\n');

      const revisionItem: Omit<RevisionItem, 'id'> = {
        title: `${t('revision.title')}: ${formData.title}`,
        description: revisionContent,
        category: 'pending',
        createdAt: Date.now(),
        revisionCount: 0,
        nextRevisionDate: eventStartDate.getTime(),
        intervalDays: 1,
      };

      addRevisionItem(revisionItem);
    }

    handleClose();
  };

  const handleDelete = () => {
    if (selectedEvent) {
      if (selectedEvent.recurrence && selectedEvent.recurrence.type !== 'none') {
        const baseId = selectedEvent.id.split('_')[0];
        deleteRecurringEvents(baseId);
      } else {
        if (selectedEvent.id.includes('_')) {
          const baseId = selectedEvent.id.split('_')[0];
          deleteRecurringEvents(baseId);
        } else {
          deleteEvent(selectedEvent.id);
        }
      }
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

  const weekdays = [
    t('event.weekdays.sun'),
    t('event.weekdays.mon'),
    t('event.weekdays.tue'),
    t('event.weekdays.wed'),
    t('event.weekdays.thu'),
    t('event.weekdays.fri'),
    t('event.weekdays.sat'),
  ];

  return (
    <div className="event-modal-overlay" onClick={handleClose}>
      <div className="event-modal" onClick={(e) => e.stopPropagation()}>
        <div className="event-modal-header">
          <h2 className="text-xl font-bold">
            {selectedEvent ? t('event.editTitle') : t('event.createTitle')}
          </h2>
          <button onClick={handleClose} className="close-button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="event-modal-content">
          <div className="form-group">
            <label>{t('event.title')}</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{t('event.startTime')}</label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>{t('event.endTime')}</label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>{t('event.description')}</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{t('event.type')}</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as CalendarEvent['type'] }))}
              >
                <option value="class">{t('event.types.class')}</option>
                <option value="study">{t('event.types.study')}</option>
                <option value="exam">{t('event.types.exam')}</option>
                <option value="personal">{t('event.types.personal')}</option>
                <option value="other">{t('event.types.other')}</option>
              </select>
            </div>
            <div className="form-group">
              <label>{t('event.location')}</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
          </div>

          {formData.type === 'class' && (
            <div className="form-group">
              <label>{t('event.professor')}</label>
              <input
                type="text"
                value={formData.professor}
                onChange={(e) => setFormData(prev => ({ ...prev, professor: e.target.value }))}
              />
            </div>
          )}

          <div className="form-group">
            <label>{t('event.color')}</label>
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

          <div className="recurrence-options" style={{ marginTop: '32px' }}>
            <div className="form-group">
              <label>{t('event.recurrence')}</label>
              <select
                value={formData.recurrence.type}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  recurrence: { ...prev.recurrence, type: e.target.value as any }
                }))}
              >
                <option value="none">{t('event.noRepeat')}</option>
                <option value="daily">{t('event.daily')}</option>
                <option value="weekly">{t('event.weekly')}</option>
                <option value="monthly">{t('event.monthly')}</option>
                <option value="yearly">{t('event.yearly')}</option>
              </select>
            </div>

            {formData.recurrence.type === 'weekly' && (
              <div className="form-group">
                <label>{t('event.weekdays')}</label>
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

          <div className="form-group" style={{ marginTop: '24px' }}>
            <div className="flex items-center space-x-3">
              <Checkbox
                id="addToRevision"
                checked={addToRevision}
                onCheckedChange={(checked) => setAddToRevision(checked === true)}
              />
              <div>
                <label htmlFor="addToRevision" className="text-sm font-medium cursor-pointer">
                  {t('event.addToRevision')}
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  {t('event.addToRevisionDesc')}
                </p>
              </div>
            </div>
          </div>

          <div className="event-modal-footer">
            {selectedEvent && (
              <button
                type="button"
                onClick={handleDelete}
                className="delete-button"
              >
                {selectedEvent.recurrence?.type !== 'none' || selectedEvent.id.includes('_') ? t('event.deleteSeries') : t('event.delete')}
              </button>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="cancel-button"
              >
                {t('event.cancel')}
              </button>
              <button
                type="submit"
                className="save-button"
              >
                {selectedEvent ? t('event.save') : t('event.create')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
