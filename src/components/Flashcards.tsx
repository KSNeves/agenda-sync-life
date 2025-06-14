
import React from 'react';
import { FlashcardsProvider } from '../context/FlashcardsContext';
import FlashcardDashboard from './flashcards/FlashcardDashboard';

export default function Flashcards() {
  return (
    <FlashcardsProvider>
      <FlashcardDashboard />
    </FlashcardsProvider>
  );
}
