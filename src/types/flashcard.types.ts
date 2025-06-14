
export interface Flashcard {
  id: string;
  front: string;
  back: string;
  deckId: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  createdAt: number;
  lastReviewed?: number;
  reviewCount: number;
  easeFactor: number; // Fator de facilidade (2.5 inicial)
  interval: number; // Intervalo atual em dias
  nextReview: number; // Timestamp da próxima revisão
  status: 'learning' | 'reviewing' | 'learned'; // Status do card
  lapses: number; // Número de vezes que esqueceu
  learningStep: number; // Passo atual na fase de aprendizagem (0, 1, 2...)
}

export interface Deck {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  cardCount: number;
  newCards: number;
  reviewCards: number;
  learnedCards: number;
  color?: string;
}

export interface StudySession {
  deckId: string;
  cardsStudied: number;
  correctAnswers: number;
  startTime: number;
  endTime?: number;
}
