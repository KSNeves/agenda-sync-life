
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RevisionItem } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface SupabaseRevisionsContextType {
  revisionItems: RevisionItem[];
  loading: boolean;
  addRevisionItem: (item: Omit<RevisionItem, 'id'>) => Promise<void>;
  updateRevisionItem: (item: RevisionItem) => Promise<void>;
  deleteRevisionItem: (itemId: string) => Promise<void>;
  loadRevisionItems: () => Promise<void>;
}

const SupabaseRevisionsContext = createContext<SupabaseRevisionsContextType | undefined>(undefined);

export function SupabaseRevisionsProvider({ children }: { children: ReactNode }) {
  const [revisionItems, setRevisionItems] = useState<RevisionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const loadRevisionItems = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_revisions')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const formattedItems: RevisionItem[] = data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        category: item.category as 'pending' | 'completed' | 'priority',
        createdAt: new Date(item.created_at || '').getTime(),
        completedAt: item.completed_at ? new Date(item.completed_at).getTime() : undefined,
        revisionCount: item.revision_count || 0,
        nextRevisionDate: new Date(item.next_revision_date).getTime(),
        intervalDays: item.interval_days || 1,
        nonStudyDays: item.non_study_days?.map(day => parseInt(day)) || [],
      }));

      setRevisionItems(formattedItems);
    } catch (error: any) {
      console.error('Error loading revision items:', error);
      toast.error('Erro ao carregar revisões');
    } finally {
      setLoading(false);
    }
  };

  const addRevisionItem = async (itemData: Omit<RevisionItem, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_revisions')
        .insert({
          user_id: user.id,
          title: itemData.title,
          description: itemData.description,
          subject: itemData.description, // Usando description como subject por simplicidade
          category: itemData.category,
          revision_count: itemData.revisionCount,
          next_revision_date: new Date(itemData.nextRevisionDate).toISOString(),
          interval_days: itemData.intervalDays,
          non_study_days: itemData.nonStudyDays?.map(day => day.toString()) || [],
          completed_at: itemData.completedAt ? new Date(itemData.completedAt).toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;

      const newItem: RevisionItem = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        category: data.category as 'pending' | 'completed' | 'priority',
        createdAt: new Date(data.created_at || '').getTime(),
        completedAt: data.completed_at ? new Date(data.completed_at).getTime() : undefined,
        revisionCount: data.revision_count || 0,
        nextRevisionDate: new Date(data.next_revision_date).getTime(),
        intervalDays: data.interval_days || 1,
        nonStudyDays: data.non_study_days?.map(day => parseInt(day)) || [],
      };

      setRevisionItems(prev => [...prev, newItem]);
      toast.success('Revisão criada com sucesso!');
    } catch (error: any) {
      console.error('Error adding revision item:', error);
      toast.error('Erro ao criar revisão');
    }
  };

  const updateRevisionItem = async (item: RevisionItem) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_revisions')
        .update({
          title: item.title,
          description: item.description,
          category: item.category,
          revision_count: item.revisionCount,
          next_revision_date: new Date(item.nextRevisionDate).toISOString(),
          interval_days: item.intervalDays,
          non_study_days: item.nonStudyDays?.map(day => day.toString()) || [],
          completed_at: item.completedAt ? new Date(item.completedAt).toISOString() : null,
        })
        .eq('id', item.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setRevisionItems(prev => prev.map(r => r.id === item.id ? item : r));
      toast.success('Revisão atualizada com sucesso!');
    } catch (error: any) {
      console.error('Error updating revision item:', error);
      toast.error('Erro ao atualizar revisão');
    }
  };

  const deleteRevisionItem = async (itemId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_revisions')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (error) throw error;

      setRevisionItems(prev => prev.filter(r => r.id !== itemId));
      toast.success('Revisão excluída com sucesso!');
    } catch (error: any) {
      console.error('Error deleting revision item:', error);
      toast.error('Erro ao excluir revisão');
    }
  };

  useEffect(() => {
    if (user) {
      loadRevisionItems();
    } else {
      setRevisionItems([]);
    }
  }, [user]);

  return (
    <SupabaseRevisionsContext.Provider value={{
      revisionItems,
      loading,
      addRevisionItem,
      updateRevisionItem,
      deleteRevisionItem,
      loadRevisionItems,
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
