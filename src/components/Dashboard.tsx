
import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, RevisionItem } from '../types';
import { Play, Pause, Check, Clock, Calendar, PlayCircle, CheckCircle, ClockIcon } from 'lucide-react';
import { categorizeRevision, calculateNextRevisionDate, adjustDateForNonStudyDays } from '../utils/spacedRepetition';
import StudyTimerModal from './StudyTimerModal';
import ProtectedFeature from './ProtectedFeature';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useTranslation } from '../hooks/useTranslation';

export default function Dashboard() {
  return (
    <ProtectedFeature feature="Dashboard">
      <DashboardContent />
    </ProtectedFeature>
  );
}

function DashboardContent() {
  const { state, dispatch } = useApp();
  const { tasks, events, revisionItems } = state;
  const { t } = useTranslation();
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
    const dayNamesShort = [
      t('weekdays.sun'),
      t('weekdays.mon'), 
      t('weekdays.tue'),
      t('weekdays.wed'),
      t('weekdays.thu'),
      t('weekdays.fri'),
      t('weekdays.sat')
    ];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - today.getDay() + i);
      const dateKey = date.toDateString();
      
      // Verificar se temos dados salvos para este dia
      const savedData = weeklyProgressData[dateKey];
      
      if (savedData) {
        // Usar dados salvos
        weekDays.push({
          day: dayNamesShort[i],
          progress: savedData.total > 0 ? (savedData.completed / savedData.total) * 100 : 0,
          completed: savedData.completed,
          total: savedData.total
        });
      } else if (date.toDateString() === today.toDateString()) {
        // Para hoje, usar dados em tempo real
        weekDays.push({
          day: dayNamesShort[i],
          progress: totalDailyTasks > 0 ? (completedRevisionsToday / totalDailyTasks) * 100 : 0,
          completed: completedRevisionsToday,
          total: totalDailyTasks
        });
      } else {
        // Para dias futuros ou dias sem dados, mostrar vazio
        weekDays.push({
          day: dayNamesShort[i],
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
      // Usar a mesma lógica de repetição espaçada da página de Revisão
      const now = Date.now();
      const newRevisionCount = revision.revisionCount + 1;
      
      // Calcula a próxima data de revisão baseada no algoritmo de repetição espaçada
      const { nextDate, intervalDays } = calculateNextRevisionDate(newRevisionCount, revision.createdAt);
      
      // Ajusta a data considerando dias não-úteis
      const adjustedNextDate = adjustDateForNonStudyDays(nextDate, revision.nonStudyDays);

      const updatedItem: RevisionItem = {
        ...revision,
        category: 'priority', // Vai para próximas revisões
        revisionCount: newRevisionCount,
        nextRevisionDate: adjustedNextDate,
        intervalDays: intervalDays,
        completedAt: now
      };

      dispatch({ type: 'UPDATE_REVISION_ITEM', payload: updatedItem });
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

  // Usar tradução para a data atual
  const formatCurrentDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    // Usar locale baseado no idioma selecionado com fallback seguro
    const locale = t('common.locale');
    const safeLocale = ['pt-BR', 'en-US', 'es-ES'].includes(locale) ? locale : 'en-US';
    
    try {
      return today.toLocaleDateString(safeLocale, options);
    } catch (error) {
      // Fallback para inglês se houver erro
      return today.toLocaleDateString('en-US', options);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div>
            <h1 className="text-4xl font-bold">{t('dashboard.title')}</h1>
            <p className="text-muted-foreground mt-2">
              {formatCurrentDate()}
            </p>
          </div>
        </header>

        <div className="space-y-6">
          {/* Today's Tasks - First */}
          <div className="bg-card/80 backdrop-blur-sm p-6 rounded-xl shadow-2xl border border-border/50 hover:shadow-3xl transition-all duration-300">
            <h3 className="text-lg font-semibold mb-4">{t('dashboard.todayTasks')}</h3>
            {todayRevisions.length === 0 ? (
              <div className="text-center text-muted-foreground bg-secondary/40 p-8 rounded-xl border border-dashed border-border/50">
                {t('dashboard.noRevisionsToday')}
              </div>
            ) : (
              <div className="space-y-3">
                {todayRevisions.map(revision => (
                  <div key={revision.id} className="bg-secondary/60 backdrop-blur-sm p-5 rounded-xl flex items-center justify-between gap-4 transition-all duration-300 hover:bg-secondary/80 hover:shadow-lg border border-border/30">
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">{revision.title}</div>
                      {revision.description && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {revision.description}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleRevisionAction(revision.id, 'start')}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                      >
                        <PlayCircle className="w-4 h-4" />
                        {t('dashboard.start')}
                      </button>
                      <button
                        onClick={() => handleRevisionAction(revision.id, 'complete')}
                        className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {t('dashboard.complete')}
                      </button>
                      <button
                        onClick={() => handleRevisionAction(revision.id, 'postpone')}
                        className="flex items-center gap-1 px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded text-sm font-medium transition-colors"
                      >
                        <ClockIcon className="w-4 h-4" />
                        {t('dashboard.postpone')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Daily Progress - Second */}
          <div className="bg-card/80 backdrop-blur-sm p-6 rounded-xl shadow-2xl border border-border/50 hover:shadow-3xl transition-all duration-300">
            <h3 className="text-lg font-semibold mb-4">{t('dashboard.dailyProgress')}</h3>
            <div className="relative mb-4">
              <div className="w-full h-3 bg-muted/50 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-700 ease-out min-w-[5px] shadow-sm"
                  style={{ width: `${dailyProgress}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-3 text-sm">
                <span className="font-bold text-foreground">{completedRevisionsToday}/{totalDailyTasks} {t('dashboard.tasks')}</span>
                <span className="text-muted-foreground">{dailyProgress.toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Weekly Progress - Third */}
          <div className="bg-card/80 backdrop-blur-sm p-6 rounded-xl shadow-2xl border border-border/50 hover:shadow-3xl transition-all duration-300">
            <h3 className="text-lg font-semibold mb-4">{t('dashboard.weeklyProgress')}</h3>
            <div className="space-y-4">
              {getWeekProgress().map((day, index) => (
                <div key={index} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/20 transition-colors">
                  <div className="w-20 text-right text-sm font-medium text-muted-foreground">{day.day}</div>
                  <div className="flex-1 relative">
                    <div className="w-full h-3 bg-muted/50 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${day.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{day.completed}/{day.total}</div>
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
    </div>
  );
}
