
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface RevisionItem {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  category: 'today' | 'priority' | 'completed' | 'pending';
  nextRevisionDate: number;
  intervalDays: number;
  revisionCount: number;
  completedAt?: number;
  createdAt: number;
  nonStudyDays: string[];
}

interface RevisionsContextType {
  revisions: RevisionItem[];
  isLoaded: boolean;
  addRevision: (revision: Omit<RevisionItem, 'id' | 'createdAt'>) => Promise<void>;
  updateRevision: (revision: RevisionItem) => Promise<void>;
  deleteRevision: (id: string) => Promise<void>;
  getRevisionsByCategory: (category: string) => RevisionItem[];
}

const RevisionsContext = createContext<RevisionsContextType | undefined>(undefined);

export function RevisionsProvider({ children }: { children: ReactNode }) {
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadRevisions();
    } else {
      setRevisions([]);
      setIsLoaded(true);
    }
  }, [user]);

  const loadRevisions = async () => {
    if (!user) return;

    try {
      console.log('🔄 Loading revisions from Supabase for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_revisions')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading revisions:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar revisões.",
          variant: "destructive",
        });
        return;
      }

      const convertedRevisions: RevisionItem[] = (data || []).map(revision => ({
        id: revision.id,
        title: revision.title,
        description: revision.description || '',
        subject: revision.subject || '',
        category: revision.category as any || 'today',
        nextRevisionDate: new Date(revision.next_revision_date).getTime(),
        intervalDays: revision.interval_days || 1,
        revisionCount: revision.revision_count || 0,
        completedAt: revision.completed_at ? new Date(revision.completed_at).getTime() : undefined,
        createdAt: new Date(revision.created_at || '').getTime(),
        nonStudyDays: revision.non_study_days || [],
      }));

      console.log('📝 Loaded revisions from Supabase:', convertedRevisions);
      setRevisions(convertedRevisions);
    } catch (error) {
      console.error('Exception loading revisions:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar revisões.",
        variant: "destructive",
      });
    } finally {
      setIsLoaded(true);
    }
  };

  const addRevision = async (revisionData: Omit<RevisionItem, 'id' | 'createdAt'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('user_revisions')
        .insert({
          user_id: user.id,
          title: revisionData.title,
          description: revisionData.description || null,
          subject: revisionData.subject || null,
          category: revisionData.category,
          next_revision_date: new Date(revisionData.nextRevisionDate).toISOString(),
          interval_days: revisionData.intervalDays,
          revision_count: revisionData.revisionCount,
          completed_at: revisionData.completedAt ? new Date(revisionData.completedAt).toISOString() : null,
          non_study_days: revisionData.nonStudyDays,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding revision:', error);
        toast({
          title: "Erro",
          description: "Erro ao adicionar revisão.",
          variant: "destructive",
        });
        throw error;
      }

      const newRevision: RevisionItem = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        subject: data.subject || '',
        category: data.category as any,
        nextRevisionDate: new Date(data.next_revision_date).getTime(),
        intervalDays: data.interval_days || 1,
        revisionCount: data.revision_count || 0,
        completedAt: data.completed_at ? new Date(data.completed_at).getTime() : undefined,
        createdAt: new Date(data.created_at).getTime(),
        nonStudyDays: data.non_study_days || [],
      };

      setRevisions(prev => [...prev, newRevision]);
      
      toast({
        title: "Sucesso",
        description: "Revisão adicionada com sucesso!",
      });
    } catch (error) {
      console.error('Exception adding revision:', error);
      throw error;
    }
  };

  const updateRevision = async (revision: RevisionItem) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_revisions')
        .update({
          title: revision.title,
          description: revision.description || null,
          subject: revision.subject || null,
          category: revision.category,
          next_revision_date: new Date(revision.nextRevisionDate).toISOString(),
          interval_days: revision.intervalDays,
          revision_count: revision.revisionCount,
          completed_at: revision.completedAt ? new Date(revision.completedAt).toISOString() : null,
          non_study_days: revision.nonStudyDays,
        })
        .eq('id', revision.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating revision:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar revisão.",
          variant: "destructive",
        });
        return;
      }

      setRevisions(prev => prev.map(r => r.id === revision.id ? revision : r));
      
      toast({
        title: "Sucesso",
        description: "Revisão atualizada com sucesso!",
      });
    } catch (error) {
      console.error('Exception updating revision:', error);
    }
  };

  const deleteRevision = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_revisions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting revision:', error);
        toast({
          title: "Erro",
          description: "Erro ao deletar revisão.",
          variant: "destructive",
        });
        return;
      }

      setRevisions(prev => prev.filter(r => r.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Revisão deletada com sucesso!",
      });
    } catch (error) {
      console.error('Exception deleting revision:', error);
    }
  };

  const getRevisionsByCategory = (category: string) => {
    return revisions.filter(revision => revision.category === category);
  };

  return (
    <RevisionsContext.Provider value={{
      revisions,
      isLoaded,
      addRevision,
      updateRevision,
      deleteRevision,
      getRevisionsByCategory,
    }}>
      {children}
    </RevisionsContext.Provider>
  );
}

export function useRevisions() {
  const context = useContext(RevisionsContext);
  if (context === undefined) {
    throw new Error('useRevisions must be used within a RevisionsProvider');
  }
  return context;
}
