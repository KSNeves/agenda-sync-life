
import React, { useState } from 'react';
import { AppProvider } from '../context/AppContext';
import Navigation from '../components/Navigation';
import Dashboard from '../components/Dashboard';
import Calendar from '../components/Calendar';
import Schedule from '../components/Schedule';
import Revision from '../components/Revision';
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
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-background">
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
        <main>
          {renderCurrentView()}
        </main>
        <EventModal />
      </div>
    </AppProvider>
  );
};

export default Index;
