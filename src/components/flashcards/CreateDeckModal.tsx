
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useFlashcards } from '../../hooks/useFlashcards';

interface CreateDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateDeckModal({ isOpen, onClose }: CreateDeckModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { createDeck, decks } = useFlashcards();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== SUBMIT FORM ===');
    console.log('Name:', name);
    console.log('Description:', description);
    console.log('Decks before creation:', decks);
    
    if (name.trim()) {
      console.log('Creating deck with name:', name.trim());
      
      try {
        const newDeckId = createDeck({
          name: name.trim(),
          description: description.trim() || undefined,
        });
        
        console.log('Deck created with ID:', newDeckId);
        console.log('Decks after creation:', decks);
        
        setName('');
        setDescription('');
        onClose();
      } catch (error) {
        console.error('Error creating deck:', error);
      }
    } else {
      console.log('Name is empty, not creating deck');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Criar Novo Deck</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nome do Deck
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Inglês - Vocabulário"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Descrição (opcional)
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva sobre o que é este deck..."
                rows={3}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                Criar Deck
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
