
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RevisionItem } from '../types';
import { Plus, Check, AlertCircle, X, Clock, Calendar, Hash } from 'lucide-react';
import CreateRevisionModal from './CreateRevisionModal';

export default function Revision() {
  const { state, dispatch } = useApp();
  const { revisionItems } = state;
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'priority'>('pending');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredItems = revisionItems.filter(item => item.category === activeTab);

  const toggleItemCompletion = (item: RevisionItem) => {
    const updatedItem: RevisionItem = {
      ...item,
      category: item.category === 'completed' ? 'pending' : 'completed',
      completedAt: item.category === 'completed' ? undefined : Date.now(),
    };

    dispatch({ type: 'UPDATE_REVISION_ITEM', payload: updatedItem });
  };

  const toggleItemPriority = (item: RevisionItem) => {
    const updatedItem: RevisionItem = {
      ...item,
      category: item.category === 'priority' ? 'pending' : 'priority',
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
    return revisionItems.filter(item => item.category === tab).length;
  };

  const getRevisionNumber = (item: RevisionItem) => {
    const itemIndex = revisionItems.findIndex(rev => rev.id === item.id);
    return itemIndex + 1;
  };

  const formatScheduledDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    
    // Se for hoje, mostrar "hoje"
    if (date.toDateString() === today.toDateString()) {
      return 'hoje';
    }
    
    // Se for amanhã, mostrar "amanhã"
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'amanhã';
    }
    
    // Caso contrário, mostrar o dia da semana e data
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
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
            <div className="space-y-6">
              {filteredItems.map(item => (
                <div key={item.id} className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow relative">
                  {/* Priority Badge */}
                  {item.category === 'priority' && (
                    <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                      Prioridade
                    </div>
                  )}
                  
                  {/* Main Content */}
                  <div className="space-y-4">
                    {/* Title */}
                    <h3 className="text-xl font-bold text-foreground">{item.title}</h3>
                    
                    {/* Description */}
                    {item.description && (
                      <p className="text-muted-foreground text-base leading-relaxed">
                        {item.description}
                      </p>
                    )}
                    
                    {/* Revision Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar size={16} />
                        <span>Agendado para: {formatScheduledDate(item.createdAt)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock size={16} />
                        <span>Tempo estimado: 30 min</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Hash size={16} />
                        <span>Revisão #{getRevisionNumber(item)}</span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Ver Conteúdo
                      </button>
                      
                      <button
                        onClick={() => toggleItemCompletion(item)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          item.category === 'completed'
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-green-100 hover:bg-green-200 text-green-800'
                        }`}
                      >
                        {item.category === 'completed' ? 'Concluída' : 'Concluir'}
                      </button>
                      
                      {activeTab !== 'completed' && (
                        <button className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                          Adiar
                        </button>
                      )}
                      
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
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
      </div>

      {/* Create Revision Modal */}
      <CreateRevisionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
