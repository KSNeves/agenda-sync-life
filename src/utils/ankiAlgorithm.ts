
// Implementação do algoritmo de repetição espaçada baseado no Anki

export const LEARNING_STEPS = [1, 10]; // Passos de aprendizagem em minutos (1 min, 10 min)
export const GRADUATING_INTERVAL = 1; // Intervalo de graduação em dias
export const EASY_INTERVAL = 4; // Intervalo para resposta "fácil" em dias
export const STARTING_EASE = 2.5; // Fator de facilidade inicial
export const MINIMUM_EASE = 1.3; // Fator de facilidade mínimo
export const EASY_BONUS = 1.3; // Multiplicador para resposta "fácil"
export const HARD_PENALTY = 1.2; // Divisor para resposta "difícil"

export interface AnkiCard {
  easeFactor: number;
  interval: number;
  reviewCount: number;
  lapses: number;
  learningStep: number;
  status: 'learning' | 'reviewing' | 'learned';
  nextReview: number;
}

export function calculateNextReview(
  card: AnkiCard,
  response: 'again' | 'hard' | 'good' | 'easy'
): Partial<AnkiCard> {
  const now = Date.now();
  let updates: Partial<AnkiCard> = {};

  if (card.status === 'learning') {
    updates = handleLearningPhase(card, response, now);
  } else if (card.status === 'reviewing' || card.status === 'learned') {
    updates = handleReviewPhase(card, response, now);
  }

  return updates;
}

function handleLearningPhase(
  card: AnkiCard,
  response: 'again' | 'hard' | 'good' | 'easy',
  now: number
): Partial<AnkiCard> {
  const updates: Partial<AnkiCard> = {
    reviewCount: card.reviewCount + 1,
  };

  if (response === 'again') {
    // Volta para o primeiro passo
    updates.learningStep = 0;
    updates.nextReview = now + (LEARNING_STEPS[0] * 60 * 1000);
  } else if (response === 'hard') {
    // Repete o passo atual
    const currentStep = Math.min(card.learningStep, LEARNING_STEPS.length - 1);
    updates.learningStep = currentStep;
    updates.nextReview = now + (LEARNING_STEPS[currentStep] * 60 * 1000);
  } else if (response === 'good') {
    const nextStep = card.learningStep + 1;
    
    if (nextStep >= LEARNING_STEPS.length) {
      // Gradua para revisão
      updates.status = 'reviewing';
      updates.interval = GRADUATING_INTERVAL;
      updates.nextReview = now + (GRADUATING_INTERVAL * 24 * 60 * 60 * 1000);
      updates.learningStep = 0;
    } else {
      // Avança para o próximo passo
      updates.learningStep = nextStep;
      updates.nextReview = now + (LEARNING_STEPS[nextStep] * 60 * 1000);
    }
  } else if (response === 'easy') {
    // Gradua direto para "learned" com intervalo fácil
    updates.status = 'learned';
    updates.interval = EASY_INTERVAL;
    updates.nextReview = now + (EASY_INTERVAL * 24 * 60 * 60 * 1000);
    updates.learningStep = 0;
  }

  return updates;
}

function handleReviewPhase(
  card: AnkiCard,
  response: 'again' | 'hard' | 'good' | 'easy',
  now: number
): Partial<AnkiCard> {
  const updates: Partial<AnkiCard> = {
    reviewCount: card.reviewCount + 1,
  };

  if (response === 'again') {
    // Volta para aprendizagem
    updates.status = 'learning';
    updates.learningStep = 0;
    updates.lapses = card.lapses + 1;
    updates.nextReview = now + (LEARNING_STEPS[0] * 60 * 1000);
    
    // Reduz o fator de facilidade
    updates.easeFactor = Math.max(
      MINIMUM_EASE,
      card.easeFactor - 0.2
    );
  } else {
    let newInterval = card.interval;
    let newEaseFactor = card.easeFactor;

    if (response === 'hard') {
      newInterval = Math.max(1, Math.round(card.interval / HARD_PENALTY));
      newEaseFactor = Math.max(MINIMUM_EASE, card.easeFactor - 0.15);
    } else if (response === 'good') {
      newInterval = Math.round(card.interval * card.easeFactor);
    } else if (response === 'easy') {
      newInterval = Math.round(card.interval * card.easeFactor * EASY_BONUS);
      newEaseFactor = card.easeFactor + 0.15;
    }

    updates.interval = newInterval;
    updates.easeFactor = newEaseFactor;
    updates.nextReview = now + (newInterval * 24 * 60 * 60 * 1000);
    updates.status = newInterval >= 21 ? 'learned' : 'reviewing'; // 21 dias = 3 semanas
  }

  return updates;
}

export function isCardDue(nextReview: number): boolean {
  return Date.now() >= nextReview;
}

export function getDueCards(cards: AnkiCard[]): AnkiCard[] {
  return cards.filter(card => isCardDue(card.nextReview));
}

export function getCardsByStatus(cards: AnkiCard[], status: 'learning' | 'reviewing' | 'learned') {
  return cards.filter(card => card.status === status);
}
