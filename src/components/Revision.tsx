
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RevisionItem } from '../types';
import { Plus, Check, Clock, AlertCircle, X } from 'lucide-react';

export default function Revision() {
  const { state, dispatch } = useApp();
  const { revisionItems } = state;
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'priority'>('pending');
  const [newItemTitle, setNewItemTitle] = useState('');

  const filteredItems = revisionItems.filter(item => item.category === activeTab);

  const addRevisionItem = () => {
    if (!newItemTitle.trim()) return;

    const newItem: RevisionItem = {
      id: Date.now().toString(),
      title: newItemTitle,
      category: activeTab,
      createdAt: Date.now(),
    };

    dispatch({ type: 'ADD_REVISION_ITEM', payload: newItem });
    setNewItemTitle('');
  };

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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Revisão</h1>
          <button
            onClick={() => setActiveTab('pending')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Criar Nova Revisão
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border mb-8">
          {(['pending', 'priority', 'completed'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {getTabLabel(tab)} ({getTabCount(tab)})
            </button>
          ))}
        </div>

        {/* Add New Item */}
        {activeTab === 'pending' && (
          <div className="mb-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                placeholder="Digite o título da nova revisão..."
                className="flex-1 px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && addRevisionItem()}
              />
              <button
                onClick={addRevisionItem}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Plus size={18} />
                Adicionar
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold mb-6 text-card-foreground">
            Revisões para {getTabLabel(activeTab)}
          </h2>

          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground text-lg mb-2">
                {activeTab === 'pending' && 'Nenhuma revisão agendada para hoje.'}
                {activeTab === 'priority' && 'Nenhuma revisão próxima.'}
                {activeTab === 'completed' && 'Nenhuma revisão concluída.'}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map(item => (
                <div key={item.id} className="bg-background border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground mb-2">{item.title}</h3>
                      {item.description && (
                        <p className="text-muted-foreground text-sm mb-3">{item.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          Criado em {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                        {item.completedAt && (
                          <span>
                            Concluído em {new Date(item.completedAt).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      {activeTab !== 'completed' && (
                        <button
                          onClick={() => toggleItemPriority(item)}
                          className={`p-2 rounded-lg transition-colors ${
                            item.category === 'priority'
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-secondary hover:bg-muted text-muted-foreground'
                          }`}
                          title={item.category === 'priority' ? 'Remover prioridade' : 'Marcar como prioridade'}
                        >
                          <AlertCircle size={16} />
                        </button>
                      )}
                      
                      <button
                        onClick={() => toggleItemCompletion(item)}
                        className={`p-2 rounded-lg transition-colors ${
                          item.category === 'completed'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-secondary hover:bg-muted text-muted-foreground'
                        }`}
                        title={item.category === 'completed' ? 'Marcar como pendente' : 'Marcar como concluído'}
                      >
                        <Check size={16} />
                      </button>
                      
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                        title="Excluir item"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
