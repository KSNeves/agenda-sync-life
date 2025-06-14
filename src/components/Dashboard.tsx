
import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Task } from '../types';
import { Play, Pause, Check, Clock, Calendar } from 'lucide-react';

export default function Dashboard() {
  const { state, dispatch } = useApp();
  const { tasks, events } = state;

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
  const todayTasks = tasks.filter(task => {
    const taskDate = new Date(task.createdAt);
    return taskDate.toDateString() === today.toDateString() && !task.postponed;
  });

  const completedTasks = todayTasks.filter(task => task.completed).length;
  const totalTasks = todayTasks.length;
  const dailyProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Weekly progress calculation
  const getWeekProgress = () => {
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - today.getDay() + i);
      
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate.toDateString() === date.toDateString();
      });
      
      const completed = dayTasks.filter(task => task.completed).length;
      const total = dayTasks.length;
      
      weekDays.push({
        day: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
        progress: total > 0 ? (completed / total) * 100 : 0,
        completed,
        total
      });
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
        <button
          onClick={addSampleTask}
          className="bg-primary text-primary-foreground px-4 py-2 rounded font-medium"
        >
          Adicionar Tarefa
        </button>
      </header>

      <div className="dashboard-content">
        {/* Today's Tasks - First */}
        <div className="dashboard-widget">
          <h3 className="text-lg font-semibold mb-4">Tarefas de Hoje</h3>
          {todayTasks.length === 0 ? (
            <div className="empty-message">
              Nenhuma tarefa para hoje. Adicione uma nova tarefa para começar!
            </div>
          ) : (
            <div className="tasks-list">
              {todayTasks.map(task => (
                <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                  <div className="task-info">
                    <div className="task-title">{task.title}</div>
                    <div className="task-duration">{task.duration} minutos</div>
                  </div>
                  
                  <div className="task-timer">
                    <div className="timer-display">
                      {formatTime(task.elapsedTime)}
                    </div>
                    
                    {task.isRunning ? (
                      <button
                        onClick={() => handleTaskAction(task.id, 'pause')}
                        className="timer-button pause"
                      >
                        <Pause size={16} />
                      </button>
                    ) : task.elapsedTime > 0 && !task.completed ? (
                      <button
                        onClick={() => handleTaskAction(task.id, 'resume')}
                        className="timer-button resume"
                      >
                        <Play size={16} />
                      </button>
                    ) : null}
                  </div>
                  
                  <div className="task-actions">
                    {!task.completed && !task.isRunning && task.elapsedTime === 0 && (
                      <button
                        onClick={() => handleTaskAction(task.id, 'start')}
                        className="action-button start"
                      >
                        <Play size={16} />
                      </button>
                    )}
                    
                    {!task.completed && (
                      <>
                        <button
                          onClick={() => handleTaskAction(task.id, 'postpone')}
                          className="action-button postpone"
                        >
                          <Clock size={16} />
                        </button>
                        <button
                          onClick={() => handleTaskAction(task.id, 'complete')}
                          className="action-button complete"
                        >
                          <Check size={16} />
                        </button>
                      </>
                    )}
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
              <span className="progress-value">{completedTasks}/{totalTasks} tarefas</span>
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
                <div className="progress-container flex-1">
                  <div className="progress-bar h-3">
                    <div 
                      className="h-full bg-secondary-color rounded-full transition-all duration-500"
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
    </div>
  );
}
