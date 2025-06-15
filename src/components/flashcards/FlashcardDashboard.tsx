
import React, { useState } from 'react';
import { Plus, BookOpen, Clock, TrendingUp, Upload, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useFlashcards } from '../../context/FlashcardsContext';
import CreateDeckModal from './CreateDeckModal';
import ImportDeckModal from './ImportDeckModal';
import DeckView from './DeckView';
import StudyMode from './StudyMode';
import { useTranslation } from '../../hooks/useTranslation';

export default function FlashcardDashboard() {
  const { decks, deleteDeck, getDecksStats, isLoaded } = useFlashcards();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [studyMode, setStudyMode] = useState<string | null>(null);

  const stats = getDecksStats();
  
  const filteredDecks = decks.filter(deck =>
    deck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deck.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteDeck = (e: React.MouseEvent, deckId: string) => {
    e.stopPropagation(); // Prevent opening the deck
    if (confirm(t('flashcards.confirmDelete'))) {
      deleteDeck(deckId);
    }
  };

  console.log('🎯 Dashboard render - Total decks:', decks.length, 'Filtered decks:', filteredDecks.length, 'Is loaded:', isLoaded);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{t('flashcards.loading')}</p>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-background text-foreground p-2 sm:p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">{t('flashcards.title')}</h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">{t('flashcards.subtitle')}</p>
          </div>
          
          {/* Desktop buttons */}
          <div className="hidden sm:flex gap-3">
            <Button 
              onClick={() => {
                console.log('🎯 Opening create modal');
                setIsCreateModalOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('flashcards.createDeck')}
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setIsImportModalOpen(true)}
            >
              <Upload className="w-4 h-4" />
              {t('flashcards.importDeck')}
            </Button>
          </div>
          
          {/* Mobile buttons - stacked */}
          <div className="flex flex-col gap-2 w-full sm:hidden">
            <Button 
              onClick={() => {
                console.log('🎯 Opening create modal');
                setIsCreateModalOpen(true);
              }}
              className="flex items-center gap-2 w-full"
            >
              <Plus className="w-4 h-4" />
              {t('flashcards.createDeck')}
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 w-full"
              onClick={() => setIsImportModalOpen(true)}
            >
              <Upload className="w-4 h-4" />
              {t('flashcards.importDeck')}
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
                  <p className="text-sm text-muted-foreground">{t('flashcards.totalDecks')}</p>
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
                  <p className="text-sm text-muted-foreground">{t('flashcards.totalCards')}</p>
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
                  <p className="text-sm text-muted-foreground">{t('flashcards.toReview')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder={t('flashcards.searchDecks')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Meus Decks Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('flashcards.myDecks')} ({decks.length})</h2>

          {/* Decks List */}
          {filteredDecks.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground text-lg">
                  {searchTerm ? t('flashcards.noDecksFound') : t('flashcards.noDecksCreate')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDecks.map(deck => (
                <Card 
                  key={deck.id} 
                  className="hover:shadow-md cursor-pointer transition-all relative group"
                  onClick={() => setSelectedDeck(deck.id)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{deck.name}</CardTitle>
                        {deck.description && (
                          <p className="text-muted-foreground text-sm">{deck.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        onClick={(e) => handleDeleteDeck(e, deck.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{deck.cardCount} {t('flashcards.cards')}</span>
                      <span>{deck.reviewCards} {t('flashcards.toReviewShort')}</span>
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
            console.log('🎯 Closing create modal');
            setIsCreateModalOpen(false);
          }}
        />

        <ImportDeckModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
        />
      </div>
    </div>
  );
}
