
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RevisionItem } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

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

  // Load revisions from Supabase
  const loadRevisions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_revisions')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const transformedRevisions: RevisionItem[] = data.map(revision => ({
        id: revision.id,
        title: revision.title,
        description: revision.description || '',
        subject: revision.subject || '',
        createdAt: new Date(revision.created_at!).getTime(),
        nextRevisionDate: new Date(revision.next_revision_date).getTime(),
        revisionCount: revision.revision_count || 0,
        intervalDays: revision.interval_days || 1,
        category: revision.category || 'today',
        completedAt: revision.completed_at ? new Date(revision.completed_at).getTime() : undefined,
        nonStudyDays: revision.non_study_days || [],
      }));

      setRevisionItems(transformedRevisions);
    } catch (error) {
      console.error('Error loading revisions:', error);
    }
  };

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadRevisions();
    } else {
      setRevisionItems([]);
    }
    setIsLoaded(true);
  }, [user]);

  const addRevisionItem = (item: Omit<RevisionItem, 'id'>) => {
    if (!user) return;

    const id = Date.now().toString();
    const newItem: RevisionItem = { ...item, id };
    
    setRevisionItems(prev => [...prev, newItem]);

    // Save to Supabase
    supabase
      .from('user_revisions')
      .insert({
        id,
        user_id: user.id,
        title: item.title,
        description: item.description,
        subject: item.subject,
        next_revision_date: new Date(item.nextRevisionDate).toISOString(),
        revision_count: item.revisionCount,
        interval_days: item.intervalDays,
        category: item.category,
        completed_at: item.completedAt ? new Date(item.completedAt).toISOString() : null,
        non_study_days: item.nonStudyDays,
      })
      .then(({ error }) => {
        if (error) {
          console.error('Error creating revision:', error);
          setRevisionItems(prev => prev.filter(r => r.id !== id));
        }
      });
  };

  const updateRevisionItem = (item: RevisionItem) => {
    setRevisionItems(prev => prev.map(r => r.id === item.id ? item : r));

    if (user) {
      supabase
        .from('user_revisions')
        .update({
          title: item.title,
          description: item.description,
          subject: item.subject,
          next_revision_date: new Date(item.nextRevisionDate).toISOString(),
          revision_count: item.revisionCount,
          interval_days: item.intervalDays,
          category: item.category,
          completed_at: item.completedAt ? new Date(item.completedAt).toISOString() : null,
          non_study_days: item.nonStudyDays,
        })
        .eq('id', item.id)
        .eq('user_id', user.id);
    }
  };

  const deleteRevisionItem = (id: string) => {
    setRevisionItems(prev => prev.filter(r => r.id !== id));

    if (user) {
      supabase
        .from('user_revisions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
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
