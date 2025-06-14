
import React, { useState } from 'react';
import { Plus, BookOpen, Clock, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useFlashcards } from '../../hooks/useFlashcards';
import CreateDeckModal from './CreateDeckModal';
import DeckView from './DeckView';
import StudyMode from './StudyMode';

export default function FlashcardDashboard() {
  const { decks, getDecksStats } = useFlashcards();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [studyMode, setStudyMode] = useState<string | null>(null);

  const stats = getDecksStats();
  
  const filteredDecks = decks.filter(deck =>
    deck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deck.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (studyMode) {
    return (
      <StudyMode
        deckId={studyMode}
        onExit={() => setStudyMode(null)}
      />
    );
  }

  if (selectedDeck) {
    return (
      <DeckView
        deckId={selectedDeck}
        onBack={() => setSelectedDeck(null)}
        onStudy={() => setStudyMode(selectedDeck)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Flashcards</h1>
          </div>
        </div>

        {/* Meus Decks Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Meus Decks</h2>
          
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Nome do novo deck"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              />
            </div>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-gray-600 hover:bg-gray-500"
            >
              Criar Deck
            </Button>
            <Button 
              variant="outline" 
              className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white"
            >
              Importar Deck (CSV)
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">{stats.totalDecks}</div>
                    <p className="text-sm text-gray-400">Total de Decks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">{stats.totalCards}</div>
                    <p className="text-sm text-gray-400">Total de Cards</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-yellow-400" />
                  <div>
                    <div className="text-2xl font-bold text-white">{stats.cardsToReview}</div>
                    <p className="text-sm text-gray-400">Para Revisar</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Decks List */}
          {filteredDecks.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-8 text-center">
                <p className="text-gray-400 text-lg">
                  {searchTerm ? 'Nenhum deck encontrado.' : 'Nenhum deck encontrado. Crie seu primeiro deck!'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDecks.map(deck => (
                <Card 
                  key={deck.id} 
                  className="bg-gray-800 border-gray-700 hover:border-gray-600 cursor-pointer transition-colors"
                  onClick={() => setSelectedDeck(deck.id)}
                >
                  <CardHeader>
                    <CardTitle className="text-white text-lg">{deck.name}</CardTitle>
                    {deck.description && (
                      <p className="text-gray-400 text-sm">{deck.description}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>{deck.cardCount} cards</span>
                      <span>{deck.reviewCards} para revisar</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <CreateDeckModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </div>
    </div>
  );
}
