
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RevisionItem } from '../types';
import { Plus, Check, Clock, AlertCircle } from 'lucide-react';

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

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'pending':
        return <Clock size={16} />;
      case 'completed':
        return <Check size={16} />;
      case 'priority':
        return <AlertCircle size={16} />;
      default:
        return null;
    }
  };

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'pending':
        return 'Pendente';
      case 'completed':
        return 'Concluído';
      case 'priority':
        return 'Prioridade';
      default:
        return '';
    }
  };

  return (
    <div className="revision-container">
      <div className="revision-header">
        <h1 className="text-2xl font-bold">Revisão</h1>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            placeholder="Novo item de revisão..."
            className="flex-1 px-3 py-2 bg-secondary border border-border rounded"
            onKeyPress={(e) => e.key === 'Enter' && addRevisionItem()}
          />
          <button
            onClick={addRevisionItem}
            className="bg-accent text-accent-foreground px-4 py-2 rounded font-medium flex items-center gap-2"
          >
            <Plus size={16} />
            Adicionar
          </button>
        </div>
      </div>

      <div className="revision-tabs">
        {(['pending', 'priority', 'completed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
          >
            <span className="flex items-center gap-2">
              {getTabIcon(tab)}
              {getTabLabel(tab)}
              <span className="bg-secondary px-2 py-0.5 rounded-full text-xs">
                {revisionItems.filter(item => item.category === tab).length}
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="revision-list">
        <h2 className="text-lg font-semibold mb-4">{getTabLabel(activeTab)}</h2>
        
        {filteredItems.length === 0 ? (
          <div className="empty-message">
            Nenhum item de revisão {activeTab === 'pending' ? 'pendente' : activeTab === 'completed' ? 'concluído' : 'prioritário'}.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map(item => (
              <div key={item.id} className="revision-item">
                <div className="revision-header">
                  <h3 className="revision-title">{item.title}</h3>
                  <div className="flex gap-2">
                    {activeTab !== 'completed' && (
                      <button
                        onClick={() => toggleItemPriority(item)}
                        className={`p-2 rounded transition-colors ${
                          item.category === 'priority'
                            ? 'bg-warning text-warning-foreground'
                            : 'bg-secondary hover:bg-muted'
                        }`}
                        title={item.category === 'priority' ? 'Remover prioridade' : 'Marcar como prioridade'}
                      >
                        <AlertCircle size={16} />
                      </button>
                    )}
                    
                    <button
                      onClick={() => toggleItemCompletion(item)}
                      className={`p-2 rounded transition-colors ${
                        item.category === 'completed'
                          ? 'bg-success text-success-foreground'
                          : 'bg-secondary hover:bg-muted'
                      }`}
                      title={item.category === 'completed' ? 'Marcar como pendente' : 'Marcar como concluído'}
                    >
                      <Check size={16} />
                    </button>
                    
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-2 rounded bg-destructive text-destructive-foreground hover:opacity-80 transition-opacity"
                      title="Excluir item"
                    >
                      ×
                    </button>
                  </div>
                </div>
                
                {item.description && (
                  <p className="text-muted-foreground text-sm mt-2">{item.description}</p>
                )}
                
                <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
