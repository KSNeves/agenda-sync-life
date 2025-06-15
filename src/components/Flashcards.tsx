
import React from 'react';
import ProtectedFeature from './ProtectedFeature';
import FlashcardDashboard from './flashcards/FlashcardDashboard';

export default function Flashcards() {
  return (
    <ProtectedFeature feature="Flashcards">
      <FlashcardDashboard />
    </ProtectedFeature>
  );
}
