import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { RevisionItem } from '../types';
import { Plus, Check, AlertCircle, X, Clock, Calendar, Hash } from 'lucide-react';
import { categorizeRevision, isRevisionDue } from '../utils/spacedRepetition';
import CreateRevisionModal from './CreateRevisionModal';

export default function Revision() {
  const { state, dispatch } = useApp();
  const { revisionItems } = state;
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'priority'>('pending');
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    const updatedItem: RevisionItem = {
      ...item,
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category === 'completed' ? 'pending' : 'completed',
      createdAt: item.createdAt,
      completedAt: item.category === 'completed' ? undefined : Date.now(),
      revisionCount: item.revisionCount,
      nextRevisionDate: item.nextRevisionDate,
      intervalDays: item.intervalDays,
    };

    dispatch({ type: 'UPDATE_REVISION_ITEM', payload: updatedItem });
  };

  const deleteItem = (id: string) => {
    dispatch({ type: 'DELETE_REVISION_ITEM', payload: id });
  };

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'pending':
        return 'Para Hoje';
      case 'priority':
        return 'Próximas';
      case 'completed':
        return 'Concluídas';
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
          <h1 className="text-3xl font-bold text-foreground">Revisão</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Criar Nova Revisão
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
            Revisões para {getTabLabel(activeTab)}
          </h2>

        {/* Items List */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-muted-foreground text-lg">
              {activeTab === 'pending' && 'Nenhuma revisão agendada para hoje.'}
              {activeTab === 'priority' && 'Nenhuma revisão próxima.'}
              {activeTab === 'completed' && 'Nenhuma revisão concluída.'}
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
                  
                  <div className="flex gap-2">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs font-medium transition-colors">
                      Ver Conteúdo
                    </button>
                    
                    <button
                      onClick={() => toggleItemCompletion(item)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        item.category === 'completed'
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-green-100 hover:bg-green-200 text-green-800'
                      }`}
                    >
                      {item.category === 'completed' ? 'Concluída' : 'Concluir'}
                    </button>
                    
                    {activeTab !== 'completed' && (
                      <button className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs font-medium transition-colors">
                        Adiar
                      </button>
                    )}
                    
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded text-xs font-medium transition-colors"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Revision Modal */}
      <CreateRevisionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
