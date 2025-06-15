
import React, { useState } from 'react';
import { Plus, BookOpen, Clock, TrendingUp, Upload, Trash2, Lock } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useFlashcards } from '../../context/FlashcardsContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { useToast } from '@/components/ui/use-toast';
import CreateDeckModal from './CreateDeckModal';
import ImportDeckModal from './ImportDeckModal';
import DeckView from './DeckView';
import StudyMode from './StudyMode';
import { useTranslation } from '../../hooks/useTranslation';

export default function FlashcardDashboard() {
  const { decks, deleteDeck, getDecksStats, isLoaded } = useFlashcards();
  const { subscribed, planType, trialEndDate } = useSubscription();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [studyMode, setStudyMode] = useState<string | null>(null);

  // Check if trial has expired
  const isTrialExpired = () => {
    if (subscribed && planType === 'premium') return false;
    if (planType === 'free') return true;
    if (!trialEndDate) return false;
    
    const today = new Date();
    const endDate = new Date(trialEndDate);
    return today > endDate;
  };

  const showUpgradeMessage = () => {
    toast({
      title: "Período de teste expirado",
      description: "Faça upgrade para continuar usando todos os recursos.",
      variant: "destructive"
    });
  };

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

  const handleCreateDeck = () => {
    if (isTrialExpired()) {
      showUpgradeMessage();
      return;
    }
    setIsCreateModalOpen(true);
  };

  const handleImportDeck = () => {
    if (isTrialExpired()) {
      showUpgradeMessage();
      return;
    }
    setIsImportModalOpen(true);
  };

  const handleDeckClick = (deckId: string) => {
    if (isTrialExpired()) {
      showUpgradeMessage();
      return;
    }
    setSelectedDeck(deckId);
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
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">{t('flashcards.title')}</h1>
            <p className="text-muted-foreground mt-2">{t('flashcards.subtitle')}</p>
          </div>
          <div className="flex gap-3">
            {isTrialExpired() ? (
              <>
                <Button 
                  onClick={showUpgradeMessage}
                  className="flex items-center gap-2 bg-gray-400 cursor-not-allowed"
                  disabled
                >
                  <Lock className="w-4 h-4" />
                  {t('flashcards.createDeck')}
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 cursor-not-allowed"
                  onClick={showUpgradeMessage}
                  disabled
                >
                  <Lock className="w-4 h-4" />
                  {t('flashcards.importDeck')}
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={handleCreateDeck}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {t('flashcards.createDeck')}
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={handleImportDeck}
                >
                  <Upload className="w-4 h-4" />
                  {t('flashcards.importDeck')}
                </Button>
              </>
            )}
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
                  className={`hover:shadow-md transition-all relative group ${
                    isTrialExpired() ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                  }`}
                  onClick={() => handleDeckClick(deck.id)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {deck.name}
                          {isTrialExpired() && <Lock className="w-4 h-4 text-gray-500" />}
                        </CardTitle>
                        {deck.description && (
                          <p className="text-muted-foreground text-sm">{deck.description}</p>
                        )}
                      </div>
                      {!isTrialExpired() && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                          onClick={(e) => handleDeleteDeck(e, deck.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
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
