
import React from 'react';
import FlashcardDashboard from './flashcards/FlashcardDashboard';

export default function Flashcards() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-2 sm:p-4 md:p-6 max-w-full overflow-hidden">
        <FlashcardDashboard />
      </div>
    </div>
  );
}
