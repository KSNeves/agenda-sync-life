
import React, { useState } from 'react';
import { RevisionItem } from '../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Button } from './ui/button';
import { Calendar, Clock, Hash, CalendarX, Edit } from 'lucide-react';
import EditRevisionModal from './EditRevisionModal';

interface ViewRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  revision: RevisionItem | null;
}

export default function ViewRevisionModal({ isOpen, onClose, revision }: ViewRevisionModalProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!revision) return null;

  const weekDayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatNextRevisionDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return 'hoje';
    }
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'amanhã';
    }
    
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  const getNonStudyDaysText = () => {
    if (!revision.nonStudyDays || revision.nonStudyDays.length === 0) {
      return 'Todos os dias';
    }
    
    return revision.nonStudyDays
      .sort((a, b) => a - b)
      .map(day => weekDayNames[day])
      .join(', ');
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] bg-card border-border overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground">
              {revision.title}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Detalhes completos da revisão programada
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-6">
            {revision.description && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Conteúdo para Revisar:
                </h3>
                <div className="bg-input border border-border rounded-lg p-4">
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {revision.description}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-input border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={16} className="text-primary" />
                  <span className="text-sm font-medium text-foreground">Data de Criação</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDate(revision.createdAt)}
                </p>
              </div>

              <div className="bg-input border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-primary" />
                  <span className="text-sm font-medium text-foreground">Próxima Revisão</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatNextRevisionDate(revision.nextRevisionDate)}
                </p>
              </div>

              <div className="bg-input border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Hash size={16} className="text-primary" />
                  <span className="text-sm font-medium text-foreground">Revisões Feitas</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {revision.revisionCount} revisões
                </p>
              </div>

              <div className="bg-input border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarX size={16} className="text-primary" />
                  <span className="text-sm font-medium text-foreground">Dias de Não Estudo</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {revision.nonStudyDays && revision.nonStudyDays.length > 0 
                    ? getNonStudyDaysText()
                    : 'Nenhum dia restrito'
                  }
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleEdit}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Edit size={16} className="mr-2" />
                Editar Revisão
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <EditRevisionModal 
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        revision={revision}
      />
    </>
  );
}
