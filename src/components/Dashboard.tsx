
import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, RevisionItem } from '../types';
import { Play, Pause, Check, Clock, Calendar, PlayCircle, CheckCircle, ClockIcon } from 'lucide-react';
import { categorizeRevision } from '../utils/spacedRepetition';
import StudyTimerModal from './StudyTimerModal';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function Dashboard() {
  const { state, dispatch } = useApp();
  const { tasks, events, revisionItems } = state;
  const [isStudyModalOpen, setIsStudyModalOpen] = useState(false);
  const [selectedRevisionTitle, setSelectedRevisionTitle] = useState('');
  const [weeklyProgressData, setWeeklyProgressData] = useLocalStorage<Record<string, { completed: number; total: number }>>('weeklyProgressData', {});

  // Timer logic
  useEffect(() => {
    const interval = setInterval(() => {
      tasks.forEach(task => {
        if (task.isRunning && task.startTime) {
          const elapsedTime = task.elapsedTime + Math.floor((Date.now() - task.startTime) / 1000);
          dispatch({
            type: 'UPDATE_TASK_TIMER',
            payload: { id: task.id, elapsedTime }
          });
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [tasks, dispatch]);

  const today = new Date();
  
  // Get today's tasks (original task system)
  const todayTasks = tasks.filter(task => {
    const taskDate = new Date(task.createdAt);
    return taskDate.toDateString() === today.toDateString() && !task.postponed;
  });

  // Get today's revisions
  const todayRevisions = revisionItems.filter(item => {
    return categorizeRevision(item) === 'pending';
  });

  // Calculate daily progress based on completed revisions today
  const completedRevisionsToday = revisionItems.filter(item => {
    const wasCompletedToday = item.completedAt && 
      new Date(item.completedAt).toDateString() === today.toDateString();
    
    return wasCompletedToday;
  }).length;
  
  const totalDailyTasks = todayRevisions.length + completedRevisionsToday;
  const dailyProgress = totalDailyTasks > 0 ? (completedRevisionsToday / totalDailyTasks) * 100 : 0;

  // Update today's progress in localStorage
  useEffect(() => {
    const todayKey = today.toDateString();
    setWeeklyProgressData(prev => ({
      ...prev,
      [todayKey]: {
        completed: completedRevisionsToday,
        total: totalDailyTasks
      }
    }));
  }, [completedRevisionsToday, totalDailyTasks, today, setWeeklyProgressData]);

  // Weekly progress calculation - baseado em revisões
  const getWeekProgress = () => {
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - today.getDay() + i);
      const dateKey = date.toDateString();
      
      // Verificar se temos dados salvos para este dia
      const savedData = weeklyProgressData[dateKey];
      
      if (savedData) {
        // Usar dados salvos
        weekDays.push({
          day: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
          progress: savedData.total > 0 ? (savedData.completed / savedData.total) * 100 : 0,
          completed: savedData.completed,
          total: savedData.total
        });
      } else if (date.toDateString() === today.toDateString()) {
        // Para hoje, usar dados em tempo real
        weekDays.push({
          day: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
          progress: totalDailyTasks > 0 ? (completedRevisionsToday / totalDailyTasks) * 100 : 0,
          completed: completedRevisionsToday,
          total: totalDailyTasks
        });
      } else {
        // Para dias futuros ou dias sem dados, mostrar vazio
        weekDays.push({
          day: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
          progress: 0,
          completed: 0,
          total: 0
        });
      }
    }
    return weekDays;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTaskAction = (taskId: string, action: string) => {
    dispatch({ type: action.toUpperCase() + '_TASK' as any, payload: taskId });
  };

  const handleRevisionAction = (revisionId: string, action: 'start' | 'complete' | 'postpone') => {
    const revision = revisionItems.find(item => item.id === revisionId);
    if (!revision) return;

    if (action === 'start') {
      setSelectedRevisionTitle(revision.title);
      setIsStudyModalOpen(true);
    } else if (action === 'complete') {
      dispatch({ 
        type: 'UPDATE_REVISION_ITEM', 
        payload: { 
          ...revision, 
          category: 'completed',
          completedAt: Date.now() // Garante que a data de conclusão seja hoje
        }
      });
    } else if (action === 'postpone') {
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 1);
      newDate.setHours(0, 0, 0, 0);
      
      dispatch({ 
        type: 'UPDATE_REVISION_ITEM', 
        payload: { 
          ...revision, 
          nextRevisionDate: newDate.getTime(),
          category: 'priority'
        }
      });
    }
  };

  const addSampleTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: `Nova Tarefa ${tasks.length + 1}`,
      duration: 60,
      completed: false,
      elapsedTime: 0,
      isRunning: false,
      createdAt: Date.now(),
    };
    dispatch({ type: 'ADD_TASK', payload: newTask });
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="date-display text-muted-foreground">
            {today.toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Today's Tasks - First */}
        <div className="dashboard-widget">
          <h3 className="text-lg font-semibold mb-4">Tarefas de Hoje</h3>
          {todayRevisions.length === 0 ? (
            <div className="empty-message">
              Nenhuma revisão para hoje. Ótimo trabalho!
            </div>
          ) : (
            <div className="tasks-list">
              {todayRevisions.map(revision => (
                <div key={revision.id} className="task-item">
                  <div className="task-info">
                    <div className="task-title">{revision.title}</div>
                    {revision.description && (
                      <div className="task-description text-sm text-muted-foreground mt-1">
                        {revision.description}
                      </div>
                    )}
                  </div>
                  
                  <div className="task-actions flex gap-2">
                    <button
                      onClick={() => handleRevisionAction(revision.id, 'start')}
                      className="action-button start flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Iniciar
                    </button>
                    <button
                      onClick={() => handleRevisionAction(revision.id, 'complete')}
                      className="action-button complete flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Concluir
                    </button>
                    <button
                      onClick={() => handleRevisionAction(revision.id, 'postpone')}
                      className="action-button postpone flex items-center gap-1 px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded text-sm font-medium transition-colors"
                    >
                      <ClockIcon className="w-4 h-4" />
                      Adiar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Daily Progress - Second */}
        <div className="dashboard-widget">
          <h3 className="text-lg font-semibold mb-4">Progresso do Dia</h3>
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${dailyProgress}%` }}
              />
            </div>
            <div className="progress-stats">
              <span className="progress-value">{completedRevisionsToday}/{totalDailyTasks} tarefas</span>
              <span className="progress-goal">{dailyProgress.toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Weekly Progress - Third */}
        <div className="dashboard-widget">
          <h3 className="text-lg font-semibold mb-4">Progresso Semanal</h3>
          <div className="weekly-progress-grid">
            {getWeekProgress().map((day, index) => (
              <div key={index} className="day-progress-row">
                <div className="day-label">{day.day}</div>
                <div className="progress-container flex-1 mt-2">
                  <div className="progress-bar h-3">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${day.progress}%` }}
                    />
                  </div>
                </div>
                <div className="day-stats">{day.completed}/{day.total}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <StudyTimerModal
        isOpen={isStudyModalOpen}
        onClose={() => setIsStudyModalOpen(false)}
        revisionTitle={selectedRevisionTitle}
      />
    </div>
  );
}
