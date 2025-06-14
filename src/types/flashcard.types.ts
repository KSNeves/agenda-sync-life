
export interface Flashcard {
  id: string;
  front: string;
  back: string;
  deckId: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  createdAt: number;
  lastReviewed?: number;
  reviewCount: number;
  easeFactor: number; // Para algoritmo de repetição espaçada
  interval: number; // Dias até próxima revisão
  nextReview: number; // Timestamp da próxima revisão
}

export interface Deck {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  cardCount: number;
  newCards: number;
  reviewCards: number;
  color?: string;
}

export interface StudySession {
  deckId: string;
  cardsStudied: number;
  correctAnswers: number;
  startTime: number;
  endTime?: number;
}
