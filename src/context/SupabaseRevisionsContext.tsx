
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RevisionItem } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { generateUUID } from '../utils/uuid';

interface RevisionsContextType {
  revisionItems: RevisionItem[];
  isLoaded: boolean;
  addRevisionItem: (item: Omit<RevisionItem, 'id'>) => void;
  updateRevisionItem: (item: RevisionItem) => void;
  deleteRevisionItem: (id: string) => void;
  clearRevisions: () => void;
}

const SupabaseRevisionsContext = createContext<RevisionsContextType | undefined>(undefined);

export function SupabaseRevisionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [revisionItems, setRevisionItems] = useState<RevisionItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadRevisions = async () => {
    if (!user) return;
    
    console.log('Carregando revisões para usuário:', user.id);
    
    try {
      const { data, error } = await supabase
        .from('user_revisions')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      console.log('Revisões carregadas do banco:', data?.length || 0);

      const transformedRevisions: RevisionItem[] = data.map(revision => ({
        id: revision.id,
        title: revision.title,
        description: revision.description || '',
        subject: revision.subject || '',
        createdAt: new Date(revision.created_at!).getTime(),
        nextRevisionDate: new Date(revision.next_revision_date).getTime(),
        revisionCount: revision.revision_count || 0,
        intervalDays: revision.interval_days || 1,
        category: (revision.category || 'pending') as 'pending' | 'completed' | 'priority',
        completedAt: revision.completed_at ? new Date(revision.completed_at).getTime() : undefined,
        nonStudyDays: revision.non_study_days?.map(day => parseInt(day)) || [],
      }));

      console.log('Revisões transformadas:', transformedRevisions.length);
      setRevisionItems(transformedRevisions);
    } catch (error) {
      console.error('Error loading revisions:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadRevisions();
    } else {
      setRevisionItems([]);
    }
    setIsLoaded(true);
  }, [user]);

  const addRevisionItem = (item: Omit<RevisionItem, 'id'>) => {
    if (!user) {
      console.log('Usuário não logado, não pode criar revisão');
      return;
    }

    const id = generateUUID();
    const newItem: RevisionItem = { ...item, id };
    
    console.log('Adicionando revisão:', newItem);
    
    setRevisionItems(prev => [...prev, newItem]);

    const revisionData = {
      id,
      user_id: user.id,
      title: item.title,
      description: item.description || '',
      subject: item.subject || '',
      next_revision_date: new Date(item.nextRevisionDate).toISOString(),
      revision_count: item.revisionCount || 0,
      interval_days: item.intervalDays || 1,
      category: item.category || 'pending',
      completed_at: item.completedAt ? new Date(item.completedAt).toISOString() : null,
      non_study_days: item.nonStudyDays?.map(day => day.toString()) || [],
    };

    console.log('Dados da revisão para salvar no banco:', revisionData);

    supabase
      .from('user_revisions')
      .insert(revisionData)
      .then(({ error }) => {
        if (error) {
          console.error('Error creating revision:', error);
          setRevisionItems(prev => prev.filter(r => r.id !== id));
        } else {
          console.log('Revisão salva com sucesso no banco:', id);
        }
      });
  };

  const updateRevisionItem = (item: RevisionItem) => {
    console.log('Atualizando revisão:', item.id);
    console.log('Dados da revisão:', item);
    
    setRevisionItems(prev => prev.map(r => r.id === item.id ? item : r));

    if (user) {
      const updateData = {
        title: item.title,
        description: item.description || '',
        subject: item.subject || '',
        next_revision_date: new Date(item.nextRevisionDate).toISOString(),
        revision_count: item.revisionCount || 0,
        interval_days: item.intervalDays || 1,
        category: item.category || 'pending',
        completed_at: item.completedAt ? new Date(item.completedAt).toISOString() : null,
        non_study_days: item.nonStudyDays?.map(day => day.toString()) || [],
      };

      console.log('Dados para atualizar no banco:', updateData);

      supabase
        .from('user_revisions')
        .update(updateData)
        .eq('id', item.id)
        .eq('user_id', user.id)
        .then(({ error }) => {
          if (error) {
            console.error('Error updating revision:', error);
          } else {
            console.log('Revisão atualizada no banco com sucesso:', item.id);
          }
        });
    }
  };

  const deleteRevisionItem = (id: string) => {
    console.log('Deletando revisão:', id);
    
    setRevisionItems(prev => prev.filter(r => r.id !== id));

    if (user) {
      supabase
        .from('user_revisions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        .then(({ error }) => {
          if (error) {
            console.error('Error deleting revision:', error);
          } else {
            console.log('Revisão deletada do banco com sucesso:', id);
          }
        });
    }
  };

  const clearRevisions = () => {
    setRevisionItems([]);

    if (user) {
      supabase
        .from('user_revisions')
        .delete()
        .eq('user_id', user.id);
    }
  };

  return (
    <SupabaseRevisionsContext.Provider value={{
      revisionItems,
      isLoaded,
      addRevisionItem,
      updateRevisionItem,
      deleteRevisionItem,
      clearRevisions,
    }}>
      {children}
    </SupabaseRevisionsContext.Provider>
  );
}

export function useSupabaseRevisions() {
  const context = useContext(SupabaseRevisionsContext);
  if (context === undefined) {
    throw new Error('useSupabaseRevisions must be used within a SupabaseRevisionsProvider');
  }
  return context;
}
