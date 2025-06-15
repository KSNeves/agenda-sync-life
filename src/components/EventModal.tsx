
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Event } from '../types';
import { X, Lock } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { useToast } from '@/components/ui/use-toast';

export default function EventModal() {
  const { state, dispatch } = useApp();
  const { isEventModalOpen, editingEvent, selectedDate } = state;
  const { subscribed, planType, trialEndDate } = useSubscription();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'study' | 'exam' | 'assignment' | 'other'>('study');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [color, setColor] = useState('#3b82f6');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceEnd, setRecurrenceEnd] = useState('');

  // Check if trial has expired
  const isTrialExpired = () => {
    if (subscribed && planType === 'premium') return false;
    if (planType === 'free') return true;
    if (!trialEndDate) return false;
    
    const today = new Date();
    const endDate = new Date(trialEndDate);
    return today > endDate;
  };

  const showUpgradeMessage = () => {
    toast({
      title: "Período de teste expirado",
      description: "Faça upgrade para continuar criando eventos.",
      variant: "destructive"
    });
  };

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setDescription(editingEvent.description || '');
      setType(editingEvent.type);
      setColor(editingEvent.color || '#3b82f6');
      
      const startDate = new Date(editingEvent.startTime);
      const endDate = new Date(editingEvent.endTime);
      setStartTime(startDate.toTimeString().slice(0, 5));
      setEndTime(endDate.toTimeString().slice(0, 5));
      
      setIsRecurring(editingEvent.isRecurring || false);
      setRecurrenceType(editingEvent.recurrenceType || 'weekly');
      setRecurrenceInterval(editingEvent.recurrenceInterval || 1);
      
      if (editingEvent.recurrenceEnd) {
        const recEndDate = new Date(editingEvent.recurrenceEnd);
        setRecurrenceEnd(recEndDate.toISOString().split('T')[0]);
      }
    } else {
      // Reset form for new event
      setTitle('');
      setDescription('');
      setType('study');
      setStartTime('09:00');
      setEndTime('10:00');
      setColor('#3b82f6');
      setIsRecurring(false);
      setRecurrenceType('weekly');
      setRecurrenceInterval(1);
      setRecurrenceEnd('');
    }
  }, [editingEvent, isEventModalOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if trial expired before allowing event creation/editing
    if (isTrialExpired()) {
      showUpgradeMessage();
      dispatch({ type: 'CLOSE_EVENT_MODAL' });
      return;
    }

    if (!title.trim()) return;

    const baseDate = selectedDate ? new Date(selectedDate) : new Date();
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startDateTime = new Date(baseDate);
    startDateTime.setHours(startHour, startMinute, 0, 0);
    
    const endDateTime = new Date(baseDate);
    endDateTime.setHours(endHour, endMinute, 0, 0);
    
    // If end time is before start time, assume it's the next day
    if (endDateTime <= startDateTime) {
      endDateTime.setDate(endDateTime.getDate() + 1);
    }

    const eventData: Omit<Event, 'id'> = {
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      startTime: startDateTime.getTime(),
      endTime: endDateTime.getTime(),
      color,
      isRecurring,
      recurrenceType: isRecurring ? recurrenceType : undefined,
      recurrenceInterval: isRecurring ? recurrenceInterval : undefined,
      recurrenceEnd: isRecurring && recurrenceEnd ? new Date(recurrenceEnd).getTime() : undefined,
    };

    if (editingEvent) {
      dispatch({
        type: 'UPDATE_EVENT',
        payload: { ...eventData, id: editingEvent.id }
      });
    } else {
      dispatch({
        type: 'ADD_EVENT',
        payload: { ...eventData, id: Date.now().toString() }
      });
    }

    dispatch({ type: 'CLOSE_EVENT_MODAL' });
  };

  const handleClose = () => {
    dispatch({ type: 'CLOSE_EVENT_MODAL' });
  };

  if (!isEventModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {editingEvent ? 'Editar Evento' : 'Novo Evento'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        {isTrialExpired() && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-red-800">
              <Lock className="w-4 h-4" />
              <span className="font-medium">Período de teste expirado</span>
            </div>
            <p className="text-red-700 text-sm mt-1">
              Faça upgrade para continuar criando eventos.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              placeholder="Digite o título do evento"
              required
              disabled={isTrialExpired()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              placeholder="Digite a descrição (opcional)"
              rows={3}
              disabled={isTrialExpired()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              disabled={isTrialExpired()}
            >
              <option value="study">Estudo</option>
              <option value="exam">Prova</option>
              <option value="assignment">Trabalho</option>
              <option value="other">Outro</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Início</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                disabled={isTrialExpired()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fim</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                disabled={isTrialExpired()}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Cor</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-10 border rounded-lg"
              disabled={isTrialExpired()}
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                disabled={isTrialExpired()}
              />
              <span className="text-sm font-medium">Evento recorrente</span>
            </label>
          </div>

          {isRecurring && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Repetir a cada</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="1"
                    value={recurrenceInterval}
                    onChange={(e) => setRecurrenceInterval(parseInt(e.target.value) || 1)}
                    className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    disabled={isTrialExpired()}
                  />
                  <select
                    value={recurrenceType}
                    onChange={(e) => setRecurrenceType(e.target.value as any)}
                    className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    disabled={isTrialExpired()}
                  >
                    <option value="daily">Dia(s)</option>
                    <option value="weekly">Semana(s)</option>
                    <option value="monthly">Mês(es)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Terminar em (opcional)</label>
                <input
                  type="date"
                  value={recurrenceEnd}
                  onChange={(e) => setRecurrenceEnd(e.target.value)}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  disabled={isTrialExpired()}
                />
              </div>
            </>
          )}

          <div className="flex gap-2 pt-4">
            {isTrialExpired() ? (
              <button
                type="button"
                onClick={showUpgradeMessage}
                className="flex-1 bg-gray-400 cursor-not-allowed text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
                disabled
              >
                <Lock className="w-4 h-4" />
                {editingEvent ? 'Salvar' : 'Criar Evento'}
              </button>
            ) : (
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                {editingEvent ? 'Salvar' : 'Criar Evento'}
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
