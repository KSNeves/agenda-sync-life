
import React, { useState, useEffect } from 'react';
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
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';

interface EditRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  revision: RevisionItem | null;
}

export default function EditRevisionModal({ isOpen, onClose, revision }: EditRevisionModalProps) {
  const { updateRevisionItem } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [nonStudyDays, setNonStudyDays] = useState<number[]>([]);

  const weekDayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  useEffect(() => {
    if (revision) {
      setTitle(revision.title);
      setDescription(revision.description || '');
      setNonStudyDays(revision.nonStudyDays || []);
    }
  }, [revision]);

  const handleSave = async () => {
    if (!revision || !title.trim()) return;

    const updatedRevision: RevisionItem = {
      ...revision,
      title: title.trim(),
      description: description.trim(),
      nonStudyDays: nonStudyDays.length > 0 ? nonStudyDays : undefined,
    };

    await updateRevisionItem(updatedRevision);
    onClose();
  };

  const toggleNonStudyDay = (dayIndex: number) => {
    setNonStudyDays(prev => 
      prev.includes(dayIndex)
        ? prev.filter(day => day !== dayIndex)
        : [...prev, dayIndex]
    );
  };

  if (!revision) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] bg-card border-border overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            Editar Revisão
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Modifique os detalhes da sua revisão
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-6">
          <div>
            <Label htmlFor="title" className="text-sm font-medium text-foreground">
              Título *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da revisão"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium text-foreground">
              Conteúdo para Revisar
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o que precisa ser revisado..."
              className="mt-1 min-h-[120px]"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-foreground mb-3 block">
              Dias de Não Estudo (opcional)
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {weekDayNames.map((day, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${index}`}
                    checked={nonStudyDays.includes(index)}
                    onCheckedChange={(checked) => {
                      if (checked === true) {
                        toggleNonStudyDay(index);
                      } else if (checked === false) {
                        toggleNonStudyDay(index);
                      }
                    }}
                  />
                  <Label 
                    htmlFor={`day-${index}`} 
                    className="text-sm cursor-pointer"
                  >
                    {day}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Marque os dias em que você não estuda para que as revisões sejam reagendadas automaticamente.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!title.trim()}
            >
              Salvar Alterações
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
