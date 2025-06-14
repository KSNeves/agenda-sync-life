
import React, { useState } from 'react';
import { Plus, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

export default function Flashcards() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Dados de exemplo - posteriormente será integrado com o contexto
  const flashcards = [
    {
      id: '1',
      front: 'O que é React?',
      back: 'React é uma biblioteca JavaScript para construir interfaces de usuário',
      category: 'Programação',
      difficulty: 'Fácil',
      createdAt: Date.now(),
      lastReviewed: Date.now() - 86400000, // 1 dia atrás
      reviewCount: 3,
      correctCount: 2
    },
    {
      id: '2',
      front: 'Qual é a fórmula da área do círculo?',
      back: 'A = π × r²',
      category: 'Matemática',
      difficulty: 'Médio',
      createdAt: Date.now(),
      lastReviewed: Date.now() - 172800000, // 2 dias atrás
      reviewCount: 5,
      correctCount: 4
    }
  ];

  const categories = ['all', 'Programação', 'Matemática', 'História', 'Ciências'];

  const filteredFlashcards = flashcards.filter(card => {
    const matchesSearch = card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.back.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || card.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Fácil': return 'bg-green-100 text-green-800';
      case 'Médio': return 'bg-yellow-100 text-yellow-800';
      case 'Difícil': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Flashcards</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie seus cartões de estudo e pratique com repetição espaçada
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Novo Flashcard
          </Button>
        </div>

        {/* Filtros e Busca */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar flashcards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'Todas as categorias' : category}
                </option>
              ))}
            </select>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{flashcards.length}</div>
              <p className="text-sm text-muted-foreground">Total de Flashcards</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {flashcards.reduce((acc, card) => acc + card.reviewCount, 0)}
              </div>
              <p className="text-sm text-muted-foreground">Revisões Feitas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((flashcards.reduce((acc, card) => acc + (card.correctCount / card.reviewCount), 0) / flashcards.length) * 100) || 0}%
              </div>
              <p className="text-sm text-muted-foreground">Taxa de Acerto</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Flashcards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFlashcards.map(card => (
            <Card key={card.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold line-clamp-2">
                    {card.front}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {card.back}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary">{card.category}</Badge>
                  <Badge className={getDifficultyColor(card.difficulty)}>
                    {card.difficulty}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  <div>Revisões: {card.reviewCount}</div>
                  <div>Acertos: {card.correctCount}/{card.reviewCount}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredFlashcards.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Nenhum flashcard encontrado com os filtros aplicados.'
                : 'Você ainda não criou nenhum flashcard. Comece criando seu primeiro!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
