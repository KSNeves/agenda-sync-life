
import React, { useState } from 'react';
import { AppProvider } from '../context/AppContext';
import { PomodoroProvider } from '../context/PomodoroContext';
import { FlashcardsProvider } from '../context/FlashcardsContext';
import { LanguageProvider } from '../context/LanguageContext';
import Navigation from '../components/Navigation';
import Dashboard from '../components/Dashboard';
import Calendar from '../components/Calendar';
import Schedule from '../components/Schedule';
import Revision from '../components/Revision';
import Flashcards from '../components/Flashcards';
import Settings from './Settings';
import Profile from './Profile';
import EventModal from '../components/EventModal';
import { useSubscription } from '../hooks/useSubscription';
import SubscriptionBlocker from '../components/SubscriptionBlocker';

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

  const { isBlocked, upgradeToPremium } = useSubscription();

  if (isBlocked) {
    return <SubscriptionBlocker onUpgrade={upgradeToPremium} />;
  }

  return (
    <LanguageProvider>
      <AppProvider>
        <PomodoroProvider>
          <FlashcardsProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              {currentView !== 'settings' && currentView !== 'profile' && (
                <Navigation 
                  activeView={currentView} 
                  onViewChange={setCurrentView}
                  onSettingsClick={() => setCurrentView('settings')}
                  onProfileClick={() => setCurrentView('profile')}
                />
              )}
              <main>
                {renderCurrentView()}
              </main>
              <EventModal />
            </div>
          </FlashcardsProvider>
        </PomodoroProvider>
      </AppProvider>
    </LanguageProvider>
  );
};

export default Index;
