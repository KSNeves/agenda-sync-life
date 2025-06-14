
import React, { useState } from 'react';
import { ArrowLeft, Plus, Play, Edit, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useFlashcards } from '../../hooks/useFlashcards';

interface DeckViewProps {
  deckId: string;
  onBack: () => void;
  onStudy: () => void;
}

export default function DeckView({ deckId, onBack, onStudy }: DeckViewProps) {
  const { getDeck, getCardsFromDeck, addCard, deleteCard } = useFlashcards();
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [editingCard, setEditingCard] = useState<string | null>(null);

  const deck = getDeck(deckId);
  const cards = getCardsFromDeck(deckId);

  if (!deck) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-destructive">Deck não encontrado</p>
          <Button onClick={onBack} className="mt-4">
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (front.trim() && back.trim()) {
      addCard(deckId, {
        front: front.trim(),
        back: back.trim(),
      });
      setFront('');
      setBack('');
    }
  };

  const handleDeleteCard = (cardId: string) => {
    deleteCard(cardId);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{deck.name}</h1>
            {deck.description && (
              <p className="text-muted-foreground mt-1">{deck.description}</p>
            )}
          </div>
          <Button onClick={onStudy} className="bg-primary hover:bg-primary/90">
            <Play className="w-4 h-4 mr-2" />
            Estudar
          </Button>
        </div>

        {/* Add Card Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Adicionar Novo Card</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Frente do Card
                </label>
                <Textarea
                  value={front}
                  onChange={(e) => setFront(e.target.value)}
                  placeholder="Digite a pergunta ou termo..."
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Verso do Card
                </label>
                <Textarea
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  placeholder="Digite a resposta ou definição..."
                  rows={3}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Card
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Cards List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Cards no Deck ({cards.length})</h2>
          
          {cards.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  Nenhum card neste deck. Adicione seu primeiro card acima!
                </p>
              </CardContent>
            </Card>
          ) : (
            cards.map(card => (
              <Card key={card.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {card.front}
                      </CardTitle>
                      <p className="text-muted-foreground">
                        {card.back}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive/80"
                        onClick={() => handleDeleteCard(card.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="text-xs text-muted-foreground">
                    Revisões: {card.reviewCount} | Criado em: {new Date(card.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
