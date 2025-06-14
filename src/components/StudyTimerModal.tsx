
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Play, Pause } from 'lucide-react';

interface StudyTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  revisionTitle: string;
}

export default function StudyTimerModal({ isOpen, onClose, revisionTitle }: StudyTimerModalProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start the timer when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeLeft(25 * 60);
      setIsRunning(true);
    }
  }, [isOpen]);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsRunning(!isRunning);
  };

  const handleClose = () => {
    setIsRunning(false);
    setTimeLeft(25 * 60);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Estudando: {revisionTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-12 space-y-8">
          {/* Timer Display */}
          <div className="text-8xl font-mono font-bold text-primary">
            {formatTime(timeLeft)}
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md bg-gray-200 rounded-full h-3">
            <div 
              className="bg-primary h-3 rounded-full transition-all duration-1000"
              style={{ 
                width: `${((25 * 60 - timeLeft) / (25 * 60)) * 100}%` 
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
                  Continuar
                </>
              )}
            </Button>
          </div>

          {/* Status */}
          <div className="text-center text-muted-foreground">
            {timeLeft === 0 ? (
              <div className="text-green-600 font-semibold text-lg">
                🎉 Tempo concluído! Parabéns!
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
