
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { RevisionItem } from '../types';
import { Plus, Calendar, Clock, Hash } from 'lucide-react';
import { categorizeRevision } from '../utils/spacedRepetition';
import CreateRevisionModal from './CreateRevisionModal';
import ViewRevisionModal from './ViewRevisionModal';
import { useTranslation } from '../hooks/useTranslation';

export default function Revision() {
  const { state, updateRevisionItem, deleteRevisionItem } = useApp();
  const { revisionItems } = state;
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'priority'>('pending');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRevision, setSelectedRevision] = useState<RevisionItem | null>(null);

  // Atualiza categorias dos itens baseado na data atual
  useEffect(() => {
    revisionItems.forEach(async (item) => {
      const currentCategory = categorizeRevision(item);
      if (item.category !== currentCategory) {
        await updateRevisionItem({ ...item, category: currentCategory });
      }
    });
  }, [revisionItems, updateRevisionItem]);

  const filteredItems = revisionItems.filter(item => item.category === activeTab);

  const toggleItemCompletion = async (item: RevisionItem) => {
    const updatedItem: RevisionItem = {
      ...item,
      category: item.category === 'completed' ? 'pending' : 'completed',
    };

    await updateRevisionItem(updatedItem);
  };

  const postponeItem = async (item: RevisionItem) => {
    // Se a revisão é para hoje ou passado, adia para amanhã
    // Se a revisão é futura, adia por mais um dia a partir da data programada
    const currentRevisionDate = new Date(item.nextRevisionDate);
    const newDate = new Date(currentRevisionDate);
    newDate.setDate(currentRevisionDate.getDate() + 1);
    newDate.setHours(0, 0, 0, 0);

    const updatedItem: RevisionItem = {
      ...item,
      nextRevisionDate: newDate.getTime(),
      category: 'priority', // Vai para próximas
    };

    await updateRevisionItem(updatedItem);
  };

  const viewRevisionContent = (item: RevisionItem) => {
    setSelectedRevision(item);
    setIsViewModalOpen(true);
  };

  const deleteItem = async (id: string) => {
    await deleteRevisionItem(id);
  };

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'pending':
        return t('revision.forToday');
      case 'priority':
        return t('revision.upcoming');
      case 'completed':
        return t('revision.completed');
      default:
        return '';
    }
  };

  const getTabCount = (tab: string) => {
    return revisionItems.filter(item => categorizeRevision(item) === tab).length;
  };

  const formatScheduledDate = (timestamp: number) => {
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

  const getNextRevisionInfo = (item: RevisionItem) => {
    if (item.category === 'completed') {
      return `Próxima em ${item.intervalDays * 2} dias`;
    }
    return formatScheduledDate(item.nextRevisionDate);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-6">
          <h1 className="text-3xl font-bold text-foreground">{t('revision.title')}</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            {t('revision.createNew')}
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <div className="flex gap-8 border-b border-border">
            {(['pending', 'priority', 'completed'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {getTabLabel(tab)} ({getTabCount(tab)})
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          <h2 className="text-2xl font-semibold mb-8 text-foreground">
            {t('revision.revisionsFor')} {getTabLabel(activeTab)}
          </h2>

          {/* Items List */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-muted-foreground text-lg">
                {activeTab === 'pending' && t('revision.noRevisionsToday')}
                {activeTab === 'priority' && t('revision.noUpcomingRevisions')}
                {activeTab === 'completed' && t('revision.noCompletedRevisions')}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map(item => (
                <div key={item.id} className="bg-card border border-border rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                        {item.description && (
                          <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2 mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar size={10} />
                        <span>{getNextRevisionInfo(item)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={10} />
                        <span>30 min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Hash size={10} />
                        <span>#{item.revisionCount + 1}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                      <button 
                        onClick={() => viewRevisionContent(item)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                      >
                        {t('revision.viewContent')}
                      </button>
                      
                      <button
                        onClick={() => toggleItemCompletion(item)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          item.category === 'completed'
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-green-100 hover:bg-green-200 text-green-800'
                        }`}
                      >
                        {item.category === 'completed' ? t('revision.completed') : t('revision.complete')}
                      </button>
                      
                      {activeTab !== 'completed' && (
                        <button 
                          onClick={() => postponeItem(item)}
                          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs font-medium transition-colors"
                        >
                          {t('revision.postpone')}
                        </button>
                      )}
                      
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded text-xs font-medium transition-colors"
                      >
                        {t('revision.delete')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Revision Modal */}
      <CreateRevisionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      {/* View Revision Modal */}
      <ViewRevisionModal 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)}
        revision={selectedRevision}
      />
    </div>
  );
}
