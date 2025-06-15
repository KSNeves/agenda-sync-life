
import React, { useState } from 'react';
import { AppProvider } from '../context/AppContext';
import { PomodoroProvider } from '../context/PomodoroContext';
import { FlashcardsProvider } from '../context/FlashcardsContext';
import { LanguageProvider } from '../context/LanguageContext';
import { SubscriptionProvider } from '../context/SubscriptionContext';
import Navigation from '../components/Navigation';
import Dashboard from '../components/Dashboard';
import Calendar from '../components/Calendar';
import Schedule from '../components/Schedule';
import Revision from '../components/Revision';
import Flashcards from '../components/Flashcards';
import Settings from './Settings';
import Profile from './Profile';
import EventModal from '../components/EventModal';
import TrialBanner from '../components/TrialBanner';

const Index = () => {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'calendar':
        return <Calendar />;
      case 'schedule':
        return <Schedule />;
      case 'revision':
        return <Revision />;
      case 'flashcards':
        return <Flashcards />;
      case 'settings':
        return <Settings onBack={() => setCurrentView('dashboard')} />;
      case 'profile':
        return <Profile onBack={() => setCurrentView('dashboard')} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <LanguageProvider>
      <AppProvider>
        <PomodoroProvider>
          <FlashcardsProvider>
            <SubscriptionProvider>
              <div className="min-h-screen bg-background">
                {currentView !== 'settings' && currentView !== 'profile' && (
                  <Navigation currentView={currentView} onViewChange={setCurrentView} />
                )}
                {currentView !== 'settings' && currentView !== 'profile' && (
                  <div className="max-w-6xl mx-auto px-4 py-4">
                    <TrialBanner />
                  </div>
                )}
                <main>
                  {renderCurrentView()}
                </main>
                <EventModal />
              </div>
            </SubscriptionProvider>
          </FlashcardsProvider>
        </PomodoroProvider>
      </AppProvider>
    </LanguageProvider>
  );
};

export default Index;
