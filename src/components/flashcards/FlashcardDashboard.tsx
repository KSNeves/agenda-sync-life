
import React, { useState } from 'react';
import { Plus, BookOpen, Clock, TrendingUp, Upload } from 'lucide-react';
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

  console.log('FlashcardDashboard render - decks:', decks);
  console.log('FlashcardDashboard render - searchTerm:', searchTerm);
  console.log('FlashcardDashboard render - isCreateModalOpen:', isCreateModalOpen);

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
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Flashcards</h1>
            <p className="text-muted-foreground mt-2">Sistema de repetição espaçada para memorização</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => {
                console.log('Create deck button clicked');
                setIsCreateModalOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Criar Deck
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Importar Deck (CSV)
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalDecks}</div>
                  <p className="text-sm text-muted-foreground">Total de Decks</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalCards}</div>
                  <p className="text-sm text-muted-foreground">Total de Cards</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-yellow-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.cardsToReview}</div>
                  <p className="text-sm text-muted-foreground">Para Revisar</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Pesquisar decks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Meus Decks Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Meus Decks</h2>

          {/* Decks List */}
          {filteredDecks.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground text-lg">
                  {searchTerm ? 'Nenhum deck encontrado.' : 'Nenhum deck encontrado. Crie seu primeiro deck!'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDecks.map(deck => (
                <Card 
                  key={deck.id} 
                  className="hover:shadow-md cursor-pointer transition-all"
                  onClick={() => setSelectedDeck(deck.id)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{deck.name}</CardTitle>
                    {deck.description && (
                      <p className="text-muted-foreground text-sm">{deck.description}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm text-muted-foreground">
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
          onClose={() => {
            console.log('Closing create deck modal');
            setIsCreateModalOpen(false);
          }}
        />
      </div>
    </div>
  );
}
