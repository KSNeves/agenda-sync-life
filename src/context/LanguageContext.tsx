import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  pt: {
    'navigation.dashboard': 'Dashboard',
    'navigation.calendar': 'Calendário',
    'navigation.schedule': 'Cronograma',
    'navigation.revision': 'Revisão',
    'navigation.flashcards': 'Flashcards',
    'navigation.settings': 'Configurações',
    'navigation.profile': 'Perfil',
    
    'dashboard.title': 'Dashboard',
    'dashboard.todayTasks': 'Tarefas de Hoje',
    'dashboard.noRevisionsToday': 'Nenhuma revisão para hoje! 🎉',
    'dashboard.start': 'Iniciar',
    'dashboard.complete': 'Concluir',
    'dashboard.postpone': 'Adiar',
    'dashboard.dailyProgress': 'Progresso Diário',
    'dashboard.tasks': 'tarefas',
    'dashboard.weeklyProgress': 'Progresso Semanal',
    
    'schedule.title': 'Cronograma',
    'schedule.subtitle': 'Gerencie sua agenda e eventos',
    'schedule.newEvent': 'Novo Evento',
    'schedule.todayEvents': 'Eventos de Hoje',
    'schedule.noEventsToday': 'Nenhum evento para hoje',
    'schedule.upcomingEvents': 'Próximos Eventos',
    'schedule.noUpcomingEvents': 'Nenhum evento próximo',
    
    'revision.title': 'Sistema de Revisão',
    'revision.subtitle': 'Gerencie seus materiais de estudo com repetição espaçada',
    'revision.createRevision': 'Criar Revisão',
    'revision.myRevisions': 'Minhas Revisões',
    'revision.pending': 'Pendentes',
    'revision.priority': 'Prioridade',
    'revision.completed': 'Concluídas',
    'revision.all': 'Todas',
    'revision.noRevisions': 'Nenhuma revisão encontrada',
    'revision.searchPlaceholder': 'Buscar revisões...',
    
    'flashcards.title': 'Flashcards',
    'flashcards.subtitle': 'Sistema de estudos com flashcards inteligentes',
    'flashcards.loading': 'Carregando...',
    'flashcards.createDeck': 'Criar Deck',
    'flashcards.importDeck': 'Importar Deck',
    'flashcards.totalDecks': 'Total de Decks',
    'flashcards.totalCards': 'Total de Cards',
    'flashcards.toReview': 'Para Revisar',
    'flashcards.searchDecks': 'Buscar decks...',
    'flashcards.myDecks': 'Meus Decks',
    'flashcards.noDecksFound': 'Nenhum deck encontrado',
    'flashcards.noDecksCreate': 'Nenhum deck criado ainda. Crie seu primeiro deck!',
    'flashcards.cards': 'cards',
    'flashcards.toReviewShort': 'revisar',
    'flashcards.confirmDelete': 'Tem certeza que deseja deletar este deck?',
    
    'settings.title': 'Configurações',
    'settings.language': 'Idioma',
    'settings.portuguese': 'Português',
    'settings.english': 'Inglês',
    'settings.spanish': 'Espanhol',
    'settings.notifications': 'Notificações',
    'settings.emailNotifications': 'Notificações por email',
    'settings.pushNotifications': 'Notificações push',
    'settings.saveChanges': 'Salvar alterações',
    'settings.changesSaved': 'Alterações salvas com sucesso!',
    
    'profile.title': 'Perfil',
    'profile.personalInfo': 'Informações Pessoais',
    'profile.name': 'Nome',
    'profile.email': 'E-mail',
    'profile.phone': 'Telefone',
    'profile.bio': 'Bio',
    'profile.preferences': 'Preferências',
    'profile.theme': 'Tema',
    'profile.light': 'Claro',
    'profile.dark': 'Escuro',
    'profile.system': 'Sistema',
    'profile.saveChanges': 'Salvar alterações',
    'profile.changesSaved': 'Alterações salvas com sucesso!'
  },
  en: {
    'navigation.dashboard': 'Dashboard',
    'navigation.calendar': 'Calendar',
    'navigation.schedule': 'Schedule',
    'navigation.revision': 'Revision',
    'navigation.flashcards': 'Flashcards',
    'navigation.settings': 'Settings',
    'navigation.profile': 'Profile',
    
    'dashboard.title': 'Dashboard',
    'dashboard.todayTasks': 'Today\'s Tasks',
    'dashboard.noRevisionsToday': 'No revisions for today! 🎉',
    'dashboard.start': 'Start',
    'dashboard.complete': 'Complete',
    'dashboard.postpone': 'Postpone',
    'dashboard.dailyProgress': 'Daily Progress',
    'dashboard.tasks': 'tasks',
    'dashboard.weeklyProgress': 'Weekly Progress',
    
    'schedule.title': 'Schedule',
    'schedule.subtitle': 'Manage your agenda and events',
    'schedule.newEvent': 'New Event',
    'schedule.todayEvents': 'Today\'s Events',
    'schedule.noEventsToday': 'No events for today',
    'schedule.upcomingEvents': 'Upcoming Events',
    'schedule.noUpcomingEvents': 'No upcoming events',
    
    'revision.title': 'Revision System',
    'revision.subtitle': 'Manage your study materials with spaced repetition',
    'revision.createRevision': 'Create Revision',
    'revision.myRevisions': 'My Revisions',
    'revision.pending': 'Pending',
    'revision.priority': 'Priority',
    'revision.completed': 'Completed',
    'revision.all': 'All',
    'revision.noRevisions': 'No revisions found',
    'revision.searchPlaceholder': 'Search revisions...',
    
    'flashcards.title': 'Flashcards',
    'flashcards.subtitle': 'Smart flashcard study system',
    'flashcards.loading': 'Loading...',
    'flashcards.createDeck': 'Create Deck',
    'flashcards.importDeck': 'Import Deck',
    'flashcards.totalDecks': 'Total Decks',
    'flashcards.totalCards': 'Total Cards',
    'flashcards.toReview': 'To Review',
    'flashcards.searchDecks': 'Search decks...',
    'flashcards.myDecks': 'My Decks',
    'flashcards.noDecksFound': 'No decks found',
    'flashcards.noDecksCreate': 'No decks created yet. Create your first deck!',
    'flashcards.cards': 'cards',
    'flashcards.toReviewShort': 'review',
    'flashcards.confirmDelete': 'Are you sure you want to delete this deck?',
    
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.portuguese': 'Portuguese',
    'settings.english': 'English',
    'settings.spanish': 'Spanish',
    'settings.notifications': 'Notifications',
    'settings.emailNotifications': 'Email notifications',
    'settings.pushNotifications': 'Push notifications',
    'settings.saveChanges': 'Save changes',
    'settings.changesSaved': 'Changes saved successfully!',
    
    'profile.title': 'Profile',
    'profile.personalInfo': 'Personal Information',
    'profile.name': 'Name',
    'profile.email': 'Email',
    'profile.phone': 'Phone',
    'profile.bio': 'Bio',
    'profile.preferences': 'Preferences',
    'profile.theme': 'Theme',
    'profile.light': 'Light',
    'profile.dark': 'Dark',
    'profile.system': 'System',
    'profile.saveChanges': 'Save changes',
    'profile.changesSaved': 'Changes saved successfully!'
  },
  es: {
    'navigation.dashboard': 'Panel',
    'navigation.calendar': 'Calendario',
    'navigation.schedule': 'Horario',
    'navigation.revision': 'Revisión',
    'navigation.flashcards': 'Tarjetas',
    'navigation.settings': 'Configuración',
    'navigation.profile': 'Perfil',
    
    'dashboard.title': 'Panel',
    'dashboard.todayTasks': 'Tareas de Hoy',
    'dashboard.noRevisionsToday': '¡No hay revisiones para hoy! 🎉',
    'dashboard.start': 'Iniciar',
    'dashboard.complete': 'Completar',
    'dashboard.postpone': 'Posponer',
    'dashboard.dailyProgress': 'Progreso Diario',
    'dashboard.tasks': 'tareas',
    'dashboard.weeklyProgress': 'Progreso Semanal',
    
    'schedule.title': 'Horario',
    'schedule.subtitle': 'Gestiona tu agenda y eventos',
    'schedule.newEvent': 'Nuevo Evento',
    'schedule.todayEvents': 'Eventos de Hoy',
    'schedule.noEventsToday': 'No hay eventos para hoy',
    'schedule.upcomingEvents': 'Próximos Eventos',
    'schedule.noUpcomingEvents': 'No hay eventos próximos',
    
    'revision.title': 'Sistema de Revisión',
    'revision.subtitle': 'Gestiona tus materiales de estudio con repetición espaciada',
    'revision.createRevision': 'Crear Revisión',
    'revision.myRevisions': 'Mis Revisiones',
    'revision.pending': 'Pendientes',
    'revision.priority': 'Prioridad',
    'revision.completed': 'Completadas',
    'revision.all': 'Todas',
    'revision.noRevisions': 'No se encontraron revisiones',
    'revision.searchPlaceholder': 'Buscar revisiones...',
    
    'flashcards.title': 'Tarjetas',
    'flashcards.subtitle': 'Sistema de estudio con tarjetas inteligentes',
    'flashcards.loading': 'Cargando...',
    'flashcards.createDeck': 'Crear Mazo',
    'flashcards.importDeck': 'Importar Mazo',
    'flashcards.totalDecks': 'Total de Mazos',
    'flashcards.totalCards': 'Total de Tarjetas',
    'flashcards.toReview': 'Para Revisar',
    'flashcards.searchDecks': 'Buscar mazos...',
    'flashcards.myDecks': 'Mis Mazos',
    'flashcards.noDecksFound': 'No se encontraron mazos',
    'flashcards.noDecksCreate': '¡Aún no se han creado mazos. Crea tu primer mazo!',
    'flashcards.cards': 'tarjetas',
    'flashcards.toReviewShort': 'revisar',
    'flashcards.confirmDelete': '¿Estás seguro de que quieres eliminar este mazo?',
    
    'settings.title': 'Configuración',
    'settings.language': 'Idioma',
    'settings.portuguese': 'Portugués',
    'settings.english': 'Inglés',
    'settings.spanish': 'Español',
    'settings.notifications': 'Notificaciones',
    'settings.emailNotifications': 'Notificaciones por correo',
    'settings.pushNotifications': 'Notificaciones push',
    'settings.saveChanges': 'Guardar cambios',
    'settings.changesSaved': '¡Cambios guardados con éxito!',
    
    'profile.title': 'Perfil',
    'profile.personalInfo': 'Información Personal',
    'profile.name': 'Nombre',
    'profile.email': 'Correo',
    'profile.phone': 'Teléfono',
    'profile.bio': 'Bio',
    'profile.preferences': 'Preferencias',
    'profile.theme': 'Tema',
    'profile.light': 'Claro',
    'profile.dark': 'Oscuro',
    'profile.system': 'Sistema',
    'profile.saveChanges': 'Guardar cambios',
    'profile.changesSaved': '¡Cambios guardados con éxito!'
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<string>(() => {
    const saved = localStorage.getItem('language');
    return saved || 'pt';
  });

  const setLanguage = (lang: string) => {
    console.log('🌐 Changing language to:', lang);
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    
    // Force a small delay to ensure state is updated
    setTimeout(() => {
      console.log('🌐 Language change completed:', lang);
    }, 100);
  };

  const t = (key: string): string => {
    const languageTranslations = translations[language as keyof typeof translations];
    const translation = languageTranslations?.[key as keyof typeof languageTranslations];
    
    if (!translation) {
      console.warn(`🌐 Translation missing for key: ${key} in language: ${language}`);
      return key;
    }
    
    return translation;
  };

  useEffect(() => {
    console.log('🌐 Language context updated:', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
