
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { usePomodoro } from '../context/PomodoroContext';

interface StudyTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  revisionTitle: string;
}

type TimerPhase = 'focus' | 'shortBreak' | 'longBreak';

export default function StudyTimerModal({ isOpen, onClose, revisionTitle }: StudyTimerModalProps) {
  const { settings } = usePomodoro();
  const [timeLeft, setTimeLeft] = useState(settings.focusTime * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<TimerPhase>('focus');
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start the timer when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeLeft(settings.focusTime * 60);
      setIsRunning(true);
      setPhase('focus');
      setCycles(0);
    }
  }, [isOpen, settings.focusTime]);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            handlePhaseComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handlePhaseComplete = () => {
    if (phase === 'focus') {
      const newCycles = cycles + 1;
      setCycles(newCycles);
      
      // Verificar se é hora da pausa longa
      if (newCycles >= settings.longBreakInterval) {
        setPhase('longBreak');
        setTimeLeft(settings.longBreak * 60);
        setCycles(0); // Reset cycles after long break
      } else {
        setPhase('shortBreak');
        setTimeLeft(settings.shortBreak * 60);
      }
      
      if (settings.autoStartBreaks) {
        setIsRunning(true);
      }
    } else {
      // Após qualquer pausa, volta para foco
      setPhase('focus');
      setTimeLeft(settings.focusTime * 60);
      
      if (settings.autoStartBreaks) {
        setIsRunning(true);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setPhase('focus');
    setCycles(0);
    setTimeLeft(settings.focusTime * 60);
  };

  const handleClose = () => {
    setIsRunning(false);
    setPhase('focus');
    setCycles(0);
    setTimeLeft(settings.focusTime * 60);
    onClose();
  };

  // Calculate progress percentage based on current phase
  const getMaxTime = () => {
    switch (phase) {
      case 'focus':
        return settings.focusTime * 60;
      case 'shortBreak':
        return settings.shortBreak * 60;
      case 'longBreak':
        return settings.longBreak * 60;
      default:
        return settings.focusTime * 60;
    }
  };

  const progressPercentage = (timeLeft / getMaxTime()) * 100;

  const getPhaseText = () => {
    switch (phase) {
      case 'focus':
        return 'Tempo de Foco';
      case 'shortBreak':
        return 'Pausa Curta';
      case 'longBreak':
        return 'Pausa Longa';
      default:
        return 'Tempo de Foco';
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'focus':
        return '#ef4444'; // red
      case 'shortBreak':
        return '#10b981'; // green
      case 'longBreak':
        return '#3b82f6'; // blue
      default:
        return '#ef4444';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {revisionTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-12 space-y-8">
          {/* Phase Indicator */}
          <div className="text-center">
            <div className="text-lg font-medium text-muted-foreground mb-2">
              {getPhaseText()}
            </div>
            <div className="text-sm text-muted-foreground">
              Ciclo {cycles + 1} de {settings.longBreakInterval}
            </div>
          </div>

          {/* Timer Display */}
          <div className="text-8xl font-mono font-bold" style={{ color: getPhaseColor() }}>
            {formatTime(timeLeft)}
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md bg-gray-300 rounded-full h-4 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-1000 ease-linear"
              style={{ 
                width: `${progressPercentage}%`,
                backgroundColor: getPhaseColor()
              }}
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <Button
              onClick={handlePlayPause}
              size="lg"
              className="flex items-center gap-2 px-8"
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  {timeLeft === 0 ? 'Próxima Fase' : 'Continuar'}
                </>
              )}
            </Button>
            
            <Button
              onClick={handleReset}
              variant="outline"
              size="lg"
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reiniciar
            </Button>
          </div>

          {/* Status */}
          <div className="text-center text-muted-foreground">
            {timeLeft === 0 ? (
              <div className="font-semibold text-lg" style={{ color: getPhaseColor() }}>
                🎉 {getPhaseText()} concluído!
              </div>
            ) : (
              <div>
                {isRunning ? 'Timer em execução...' : 'Timer pausado'}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
