import { useState, useEffect } from 'react';
import { Flashcard, Deck } from '../types/flashcard.types';

export function useFlashcards() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    console.log('🔄 Loading data from localStorage...');
    const savedDecks = localStorage.getItem('flashcard-decks');
    const savedCards = localStorage.getItem('flashcard-cards');
    
    try {
      if (savedDecks) {
        const parsedDecks = JSON.parse(savedDecks);
        console.log('📚 Loaded decks from localStorage:', parsedDecks);
        setDecks(parsedDecks);
      } else {
        console.log('📚 No decks found in localStorage');
        setDecks([]);
      }
      
      if (savedCards) {
        const parsedCards = JSON.parse(savedCards);
        console.log('🃏 Loaded cards from localStorage:', parsedCards);
        setFlashcards(parsedCards);
      } else {
        console.log('🃏 No cards found in localStorage');
        setFlashcards([]);
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      setDecks([]);
      setFlashcards([]);
    }
    
    setIsLoaded(true);
  }, []);

  // Save decks to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      console.log('💾 Saving decks to localStorage:', decks);
      localStorage.setItem('flashcard-decks', JSON.stringify(decks));
    }
  }, [decks, isLoaded]);

  // Save cards to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      console.log('💾 Saving cards to localStorage:', flashcards);
      localStorage.setItem('flashcard-cards', JSON.stringify(flashcards));
    }
  }, [flashcards, isLoaded]);

  const createDeck = (deckData: { name: string; description?: string }) => {
    console.log('🆕 Creating new deck:', deckData);
    
    const newDeck: Deck = {
      id: Date.now().toString(),
      name: deckData.name,
      description: deckData.description,
      createdAt: Date.now(),
      cardCount: 0,
      newCards: 0,
      reviewCards: 0,
    };

    console.log('🆕 New deck object:', newDeck);

    // Use functional update to ensure we get the latest state
    setDecks(prevDecks => {
      const updatedDecks = [...prevDecks, newDeck];
      console.log('📚 Updated decks array:', updatedDecks);
      return updatedDecks;
    });
    
    return newDeck.id;
  };

  const deleteDeck = (deckId: string) => {
    setDecks(prev => prev.filter(deck => deck.id !== deckId));
    setFlashcards(prev => prev.filter(card => card.deckId !== deckId));
  };

  const getDeck = (deckId: string) => {
    return decks.find(deck => deck.id === deckId);
  };

  const addCard = (deckId: string, cardData: { front: string; back: string }) => {
    const newCard: Flashcard = {
      id: Date.now().toString(),
      front: cardData.front,
      back: cardData.back,
      deckId,
      createdAt: Date.now(),
      reviewCount: 0,
      easeFactor: 2.5,
      interval: 1,
      nextReview: Date.now(),
      status: 'unlearned',
      easyCount: 0,
      mediumCount: 0,
      hardCount: 0,
    };

    setFlashcards(prev => {
      const updated = [...prev, newCard];
      updateDeckStatsWithCards(deckId, updated);
      return updated;
    });
  };

  const deleteCard = (cardId: string) => {
    setFlashcards(prev => {
      const card = prev.find(c => c.id === cardId);
      const updated = prev.filter(c => c.id !== cardId);
      if (card) {
        updateDeckStatsWithCards(card.deckId, updated);
      }
      return updated;
    });
  };

  const getCardsFromDeck = (deckId: string) => {
    return flashcards.filter(card => card.deckId === deckId);
  };

  const reviewCard = (cardId: string, difficulty: 'easy' | 'medium' | 'hard') => {
    setFlashcards(prev => {
      const updated = prev.map(card => {
        if (card.id === cardId) {
          const newReviewCount = card.reviewCount + 1;
          let newStatus = card.status;
          let newEasyCount = card.easyCount;
          let newMediumCount = card.mediumCount;
          let newHardCount = card.hardCount;

          if (difficulty === 'easy') {
            newEasyCount += 1;
            if (card.status === 'unlearned') {
              newStatus = 'reviewing';
            } else if (card.status === 'reviewing' && newEasyCount >= 2) {
              newStatus = 'learned';
            }
          } else if (difficulty === 'medium') {
            newMediumCount += 1;
            if (card.status === 'unlearned') {
              newStatus = 'reviewing';
            }
          } else if (difficulty === 'hard') {
            newHardCount += 1;
            if (card.status === 'unlearned') {
              newStatus = 'reviewing';
            }
          }

          return {
            ...card,
            difficulty,
            reviewCount: newReviewCount,
            lastReviewed: Date.now(),
            status: newStatus,
            easyCount: newEasyCount,
            mediumCount: newMediumCount,
            hardCount: newHardCount,
          };
        }
        return card;
      });

      const reviewedCard = updated.find(c => c.id === cardId);
      if (reviewedCard) {
        updateDeckStatsWithCards(reviewedCard.deckId, updated);
      }
      
      return updated;
    });
  };

  const restartStudies = (deckId: string) => {
    setFlashcards(prev => {
      const updated = prev.map(card => {
        if (card.deckId === deckId) {
          return {
            ...card,
            status: 'unlearned' as const,
            reviewCount: 0,
            easyCount: 0,
            mediumCount: 0,
            hardCount: 0,
            lastReviewed: undefined,
          };
        }
        return card;
      });
      
      updateDeckStatsWithCards(deckId, updated);
      return updated;
    });
  };

  const updateDeckStatsWithCards = (deckId: string, cards: Flashcard[]) => {
    const deckCards = cards.filter(card => card.deckId === deckId);
    const cardCount = deckCards.length;
    const newCards = deckCards.filter(card => card.status === 'unlearned').length;
    const reviewCards = deckCards.filter(card => card.status === 'reviewing').length;

    setDecks(prev => prev.map(deck => 
      deck.id === deckId 
        ? { ...deck, cardCount, newCards, reviewCards }
        : deck
    ));
  };

  const getDecksStats = () => {
    const totalDecks = decks.length;
    const totalCards = flashcards.length;
    const cardsToReview = flashcards.filter(card => 
      card.status === 'reviewing'
    ).length;

    return { totalDecks, totalCards, cardsToReview };
  };

  return {
    decks,
    flashcards,
    createDeck,
    deleteDeck,
    getDeck,
    addCard,
    deleteCard,
    getCardsFromDeck,
    reviewCard,
    restartStudies,
    getDecksStats,
    isLoaded,
  };
}
