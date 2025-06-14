
import { RevisionItem } from '../types';

export const INITIAL_INTERVAL = 1; // 1 dia

export function calculateNextRevisionDate(revisionCount: number, createdAt: number): { nextDate: number; intervalDays: number } {
  let intervalDays = INITIAL_INTERVAL;
  
  // Calcula o intervalo baseado na contagem de revisões
  // 1 dia, 3 dias, 7 dias, 15 dias, 30 dias, 60 dias, 90 dias, etc.
  if (revisionCount === 0) {
    intervalDays = 1;
  } else if (revisionCount === 1) {
    intervalDays = 3;
  } else if (revisionCount === 2) {
    intervalDays = 7;
  } else if (revisionCount === 3) {
    intervalDays = 15;
  } else if (revisionCount === 4) {
    intervalDays = 30;
  } else {
    // Para revisões 5+, dobra o intervalo anterior
    let currentInterval = 30;
    for (let i = 5; i <= revisionCount; i++) {
      currentInterval *= 2;
    }
    intervalDays = currentInterval;
  }
  
  const nextDate = createdAt + (intervalDays * 24 * 60 * 60 * 1000);
  return { nextDate, intervalDays };
}

export function adjustDateForNonStudyDays(timestamp: number, nonStudyDays?: number[]): number {
  if (!nonStudyDays || nonStudyDays.length === 0) {
    return timestamp;
  }

  const date = new Date(timestamp);
  let adjustedDate = new Date(date);
  
  // Se a data cai em um dia não-útil, move para o próximo dia útil
  while (nonStudyDays.includes(adjustedDate.getDay())) {
    adjustedDate.setDate(adjustedDate.getDate() + 1);
  }
  
  return adjustedDate.getTime();
}

export function isRevisionDue(nextRevisionDate: number): boolean {
  const now = Date.now();
  const today = new Date(now);
  const revisionDate = new Date(nextRevisionDate);
  
  // Verifica se a data de revisão é hoje ou no passado
  return revisionDate.toDateString() <= today.toDateString();
}

export function categorizeRevision(item: RevisionItem): 'pending' | 'priority' | 'completed' {
  const now = Date.now();
  const today = new Date(now);
  
  // Ajusta a data da revisão considerando dias não-úteis
  const adjustedRevisionDate = adjustDateForNonStudyDays(item.nextRevisionDate, item.nonStudyDays);
  const revisionDate = new Date(adjustedRevisionDate);
  
  // Se foi recém concluída, fica em priority (próximas)
  if (item.completedAt && new Date(item.completedAt).toDateString() === today.toDateString()) {
    return 'priority';
  }
  
  // Se a data de revisão é hoje, vai para pending
  if (revisionDate.toDateString() === today.toDateString()) {
    return 'pending';
  }
  
  // Se a data de revisão é futura, vai para priority (próximas)
  if (revisionDate > today) {
    return 'priority';
  }
  
  // Se está atrasada, vai para pending
  return 'pending';
}
