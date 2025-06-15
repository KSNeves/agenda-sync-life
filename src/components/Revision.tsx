import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { RevisionItem } from '../types';
import { Plus, Calendar, Clock, Hash, Lock } from 'lucide-react';
import { categorizeRevision, calculateNextRevisionDate, adjustDateForNonStudyDays } from '../utils/spacedRepetition';
import CreateRevisionModal from './CreateRevisionModal';
import ViewRevisionModal from './ViewRevisionModal';
import { useLanguage } from '../context/LanguageContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useToast } from '@/components/ui/use-toast';

export default function Revision() {
  const { state, dispatch } = useApp();
  const { revisionItems } = state;
  const { t } = useLanguage();
  const { subscribed, planType, trialEndDate } = useSubscription();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'priority'>('pending');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRevision, setSelectedRevision] = useState<RevisionItem | null>(null);

  // Check if trial has expired
  const isTrialExpired = () => {
    if (subscribed && planType === 'premium') return false;
    if (planType === 'free') return true;
    if (!trialEndDate) return false;
    
    const today = new Date();
    const endDate = new Date(trialEndDate);
    return today > endDate;
  };

  const showUpgradeMessage = () => {
    toast({
      title: "Período de teste expirado",
      description: "Faça upgrade para continuar usando todos os recursos.",
      variant: "destructive"
    });
  };

  // Atualiza categorias dos itens baseado na data atual
  useEffect(() => {
    revisionItems.forEach(item => {
      const currentCategory = categorizeRevision(item);
      if (item.category !== currentCategory) {
        dispatch({ 
          type: 'UPDATE_REVISION_ITEM', 
          payload: { ...item, category: currentCategory }
        });
      }
    });
  }, [revisionItems, dispatch]);

  const filteredItems = revisionItems.filter(item => item.category === activeTab);

  const toggleItemCompletion = (item: RevisionItem) => {
    // Check if trial expired before allowing completion
    if (isTrialExpired()) {
      showUpgradeMessage();
      return;
    }

    if (item.category === 'completed') {
      // Se já está concluído, volta para pending
      const updatedItem: RevisionItem = {
        ...item,
        category: 'pending',
        completedAt: undefined
      };
      dispatch({ type: 'UPDATE_REVISION_ITEM', payload: updatedItem });
    } else {
      // Marca como concluído e calcula próxima revisão usando repetição espaçada
      const now = Date.now();
      const newRevisionCount = item.revisionCount + 1;
      
      // Calcula a próxima data de revisão baseada no algoritmo de repetição espaçada
      const { nextDate, intervalDays } = calculateNextRevisionDate(newRevisionCount, item.createdAt);
      
      // Ajusta a data considerando dias não-úteis
      const adjustedNextDate = adjustDateForNonStudyDays(nextDate, item.nonStudyDays);

      const updatedItem: RevisionItem = {
        ...item,
        category: 'priority', // Vai para próximas revisões
        revisionCount: newRevisionCount,
        nextRevisionDate: adjustedNextDate,
        intervalDays: intervalDays,
        completedAt: now
      };

      dispatch({ type: 'UPDATE_REVISION_ITEM', payload: updatedItem });
    }
  };

  const postponeItem = (item: RevisionItem) => {
    // Check if trial expired before allowing postpone
    if (isTrialExpired()) {
      showUpgradeMessage();
      return;
    }

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

    dispatch({ type: 'UPDATE_REVISION_ITEM', payload: updatedItem });
  };

  const viewRevisionContent = (item: RevisionItem) => {
    // Allow viewing content even if trial expired
    setSelectedRevision(item);
    setIsViewModalOpen(true);
  };

  const deleteItem = (id: string) => {
    // Check if trial expired before allowing deletion
    if (isTrialExpired()) {
      showUpgradeMessage();
      return;
    }

    dispatch({ type: 'DELETE_REVISION_ITEM', payload: id });
  };

  const handleCreateRevision = () => {
    if (isTrialExpired()) {
      showUpgradeMessage();
      return;
    }
    setIsModalOpen(true);
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
    
    // Aplica o ajuste de dias não-úteis para exibição
    const adjustedDate = adjustDateForNonStudyDays(item.nextRevisionDate, item.nonStudyDays);
    return formatScheduledDate(adjustedDate);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-6">
          <h1 className="text-3xl font-bold text-foreground">{t('revision.title')}</h1>
          {isTrialExpired() ? (
            <button
              onClick={showUpgradeMessage}
              className="bg-gray-400 cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
              disabled
            >
              <Lock size={20} />
              {t('revision.createNew')}
            </button>
          ) : (
            <button
              onClick={handleCreateRevision}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              {t('revision.createNew')}
            </button>
          )}
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
                <div key={item.id} className={`bg-card border border-border rounded-lg p-3 hover:shadow-md transition-shadow ${
                  isTrialExpired() ? 'opacity-60' : ''
                }`}>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                          {item.title}
                          {isTrialExpired() && <Lock className="w-4 h-4 text-gray-500" />}
                        </h3>
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
                      
                      {isTrialExpired() ? (
                        <button
                          onClick={showUpgradeMessage}
                          className="bg-gray-400 cursor-not-allowed text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                          disabled
                        >
                          <Lock className="w-3 h-3" />
                          {item.category === 'completed' ? t('revision.completed') : t('revision.complete')}
                        </button>
                      ) : (
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
                      )}
                      
                      {activeTab !== 'completed' && (
                        <>
                          {isTrialExpired() ? (
                            <button
                              onClick={showUpgradeMessage}
                              className="bg-gray-400 cursor-not-allowed text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                              disabled
                            >
                              <Lock className="w-3 h-3" />
                              {t('revision.postpone')}
                            </button>
                          ) : (
                            <button 
                              onClick={() => postponeItem(item)}
                              className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs font-medium transition-colors"
                            >
                              {t('revision.postpone')}
                            </button>
                          )}
                        </>
                      )}
                      
                      {isTrialExpired() ? (
                        <button
                          onClick={showUpgradeMessage}
                          className="bg-gray-400 cursor-not-allowed text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                          disabled
                        >
                          <Lock className="w-3 h-3" />
                          {t('revision.delete')}
                        </button>
                      ) : (
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded text-xs font-medium transition-colors"
                        >
                          {t('revision.delete')}
                        </button>
                      )}
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
