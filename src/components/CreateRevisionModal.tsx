
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RevisionItem } from '../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';

interface CreateRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateRevisionModal({ isOpen, onClose }: CreateRevisionModalProps) {
  const { dispatch } = useApp();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [nonStudyDays, setNonStudyDays] = useState<number[]>([]);

  const weekDays = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Segunda-feira' },
    { value: 2, label: 'Terça-feira' },
    { value: 3, label: 'Quarta-feira' },
    { value: 4, label: 'Quinta-feira' },
    { value: 5, label: 'Sexta-feira' },
    { value: 6, label: 'Sábado' },
  ];

  const handleNonStudyDayToggle = (dayValue: number) => {
    setNonStudyDays(prev => 
      prev.includes(dayValue) 
        ? prev.filter(day => day !== dayValue)
        : [...prev, dayValue]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    const now = Date.now();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0); // Define para o início do dia

    const newRevision: RevisionItem = {
      id: Date.now().toString(),
      title: title.trim(),
      description: content.trim() || undefined,
      category: 'pending',
      createdAt: now,
      revisionCount: 0,
      nextRevisionDate: today.getTime(), // Começa hoje
      intervalDays: 1,
      nonStudyDays: nonStudyDays.length > 0 ? nonStudyDays : undefined,
    };

    dispatch({ type: 'ADD_REVISION_ITEM', payload: newRevision });
    
    // Reset form
    setTitle('');
    setContent('');
    setSubject('');
    setEstimatedTime('');
    setNonStudyDays([]);
    
    onClose();
  };

  const handleCancel = () => {
    // Reset form
    setTitle('');
    setContent('');
    setSubject('');
    setEstimatedTime('');
    setNonStudyDays([]);
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground text-center">
            Criar Nova Revisão
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div>
            <label className="block text-foreground text-sm font-medium mb-2">
              Título da Revisão:
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Conceitos de Cálculo I"
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              required
            />
          </div>

          <div>
            <label className="block text-foreground text-sm font-medium mb-2">
              Conteúdo para Revisar:
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Descreva o que precisa ser revisado em detalhes..."
              className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-[120px] resize-none"
              rows={5}
            />
          </div>

          <div>
            <label className="block text-foreground text-sm font-medium mb-2">
              Assunto/Disciplina (Opcional):
            </label>
            <Input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex: Matemática, Biologia, História"
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <label className="block text-foreground text-sm font-medium mb-2">
              Tempo Estimado (minutos):
            </label>
            <Input
              type="number"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
              placeholder="30"
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              min="1"
            />
          </div>

          <div>
            <label className="block text-foreground text-sm font-medium mb-3">
              Dias que não estuda (opcional):
            </label>
            <div className="grid grid-cols-2 gap-3">
              {weekDays.map((day) => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${day.value}`}
                    checked={nonStudyDays.includes(day.value)}
                    onCheckedChange={() => handleNonStudyDayToggle(day.value)}
                  />
                  <label
                    htmlFor={`day-${day.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground"
                  >
                    {day.label}
                  </label>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              As revisões programadas para estes dias serão automaticamente adiadas para o próximo dia útil.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3"
            >
              Criar Revisão
            </Button>
            <Button
              type="button"
              onClick={handleCancel}
              variant="secondary"
              className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium py-3"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
