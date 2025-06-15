
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RevisionItem } from '../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { useTranslation } from '../hooks/useTranslation';

interface CreateRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateRevisionModal({ isOpen, onClose }: CreateRevisionModalProps) {
  const { dispatch } = useApp();
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [nonStudyDays, setNonStudyDays] = useState<number[]>([]);

  const weekDays = [
    { value: 0, label: t('days.sunday') },
    { value: 1, label: t('days.monday') },
    { value: 2, label: t('days.tuesday') },
    { value: 3, label: t('days.wednesday') },
    { value: 4, label: t('days.thursday') },
    { value: 5, label: t('days.friday') },
    { value: 6, label: t('days.saturday') },
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] bg-card border-border overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground text-center">
            {t('revision.createTitle')}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-center">
            {t('revision.createDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div>
            <label className="block text-foreground text-sm font-medium mb-2">
              {t('revision.titleLabel')}
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('revision.titlePlaceholder')}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              required
            />
          </div>

          <div>
            <label className="block text-foreground text-sm font-medium mb-2">
              {t('revision.contentLabel')}
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('revision.contentPlaceholder')}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-[120px] resize-none"
              rows={5}
            />
          </div>

          <div>
            <label className="block text-foreground text-sm font-medium mb-2">
              {t('revision.subjectLabel')}
            </label>
            <Input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t('revision.subjectPlaceholder')}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <label className="block text-foreground text-sm font-medium mb-2">
              {t('revision.timeLabel')}
            </label>
            <Input
              type="number"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
              placeholder={t('revision.timePlaceholder')}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              min="1"
            />
          </div>

          <div>
            <label className="block text-foreground text-sm font-medium mb-3">
              {t('revision.nonStudyDaysLabel')}
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
              {t('revision.nonStudyDaysDescription')}
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3"
            >
              {t('revision.create')}
            </Button>
            <Button
              type="button"
              onClick={handleCancel}
              variant="secondary"
              className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium py-3"
            >
              {t('revision.cancel')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
