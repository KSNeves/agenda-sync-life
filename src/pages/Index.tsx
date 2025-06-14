
import React, { useState } from 'react';
import { AppProvider } from '../context/AppContext';
import { PomodoroProvider } from '../context/PomodoroContext';
import { FlashcardsProvider } from '../context/FlashcardsContext';
import { useAuth } from '../context/AuthContext';
import Navigation from '../components/Navigation';
import Dashboard from '../components/Dashboard';
import Calendar from '../components/Calendar';
import Schedule from '../components/Schedule';
import Revision from '../components/Revision';
import Flashcards from '../components/Flashcards';
import Settings from './Settings';
import Profile from './Profile';
import EventModal from '../components/EventModal';
import LoginRegister from './LoginRegister';

const Index = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const { user, isLoading } = useAuth();

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, mostrar página de login
  if (!user) {
    return <LoginRegister />;
  }

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
      <PomodoroProvider>
        <FlashcardsProvider>
          <div className="min-h-screen bg-background">
            {currentView !== 'settings' && currentView !== 'profile' && (
              <Navigation currentView={currentView} onViewChange={setCurrentView} />
            )}
            <main>
              {renderCurrentView()}
            </main>
            <EventModal />
          </div>
        </FlashcardsProvider>
      </PomodoroProvider>
    </AppProvider>
  );
};

export default Index;
