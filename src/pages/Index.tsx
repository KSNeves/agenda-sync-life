
import React, { useState } from 'react';
import { AppProvider } from '../context/AppContext';
import Navigation from '../components/Navigation';
import Dashboard from '../components/Dashboard';
import Calendar from '../components/Calendar';
import Schedule from '../components/Schedule';
import Revision from '../components/Revision';
import Flashcards from '../components/Flashcards';
import Settings from './Settings';
import Profile from './Profile';
import EventModal from '../components/EventModal';

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
    <AppProvider>
      <div className="min-h-screen bg-background">
        {currentView !== 'settings' && currentView !== 'profile' && (
          <Navigation currentView={currentView} onViewChange={setCurrentView} />
        )}
        <main>
          {renderCurrentView()}
        </main>
        <EventModal />
      </div>
    </AppProvider>
  );
};

export default Index;
