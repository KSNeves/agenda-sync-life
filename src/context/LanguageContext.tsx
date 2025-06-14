
import React, { createContext, useState, useContext, useCallback } from 'react';

interface Translation {
  [key: string]: string | Translation;
}

interface LanguageContextProps {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps>({
  language: 'pt',
  setLanguage: () => {},
  t: (key: string) => key,
});

interface LanguageProviderProps {
  children: React.ReactNode;
}

const translations = {
  pt: {
    common: {
      locale: 'pt-BR',
      save: 'Salvar',
      cancel: 'Cancelar',
      edit: 'Editar',
      delete: 'Excluir',
      optional: 'Opcional',
      back: 'Voltar',
    },
    dashboard: {
      title: 'Painel',
      todayTasks: 'Revisões de Hoje',
      dailyProgress: 'Progresso Diário',
      weeklyProgress: 'Progresso Semanal',
      noTasksToday: 'Nenhuma tarefa para hoje!',
      noRevisionsToday: 'Nenhuma revisão para hoje!',
      start: 'Começar',
      complete: 'Concluir',
      postpone: 'Adiar',
      tasks: 'tarefas'
    },
    event: {
      title: 'Evento',
      description: 'Descrição',
      startTime: 'Hora de Início',
      endTime: 'Hora de Término',
      customColor: 'Cor',
      addEvent: 'Adicionar Evento',
      editEvent: 'Editar Evento',
      deleteEvent: 'Excluir Evento',
      weekdays: {
        sun: 'Dom',
        mon: 'Seg',
        tue: 'Ter',
        wed: 'Qua',
        thu: 'Qui',
        fri: 'Sex',
        sat: 'Sáb'
      }
    },
    schedule: {
      title: 'Agenda',
      createEvent: 'Criar Evento',
      today: 'Hoje',
      day: 'Dia',
      week: 'Semana',
      month: 'Mês'
    },
    settings: {
      title: 'Configurações',
      appearance: 'Aparência',
      darkMode: 'Modo Escuro',
      language: 'Idioma',
      notifications: 'Notificações',
      pushNotifications: 'Notificações Push',
      studyReminders: 'Lembretes de Estudo',
      pomodoro: 'Pomodoro',
      focusTime: 'Tempo de Foco',
      shortBreak: 'Pausa Curta',
      longBreak: 'Pausa Longa',
      longBreakInterval: 'Intervalo da Pausa Longa',
      autoStartBreaks: 'Iniciar Pausas Automaticamente',
      resetData: 'Redefinir Dados',
      deleteSchedule: 'Excluir Agenda',
      deleteAllData: 'Excluir Todos os Dados',
      scheduleDeleted: 'Agenda excluída',
      allDataDeleted: 'Todos os dados excluídos',
      changesSaved: 'Alterações salvas',
      appearance: {
        desc: 'Personalize a aparência da aplicação'
      },
      darkMode: {
        desc: 'Alternar entre tema claro e escuro'
      },
      language: {
        placeholder: 'Selecione um idioma'
      },
      notifications: {
        desc: 'Configure suas preferências de notificação'
      },
      pushNotifications: {
        desc: 'Receber notificações no dispositivo'
      },
      studyReminders: {
        desc: 'Receber lembretes para estudar'
      },
      pomodoro: {
        desc: 'Configure os tempos do Pomodoro'
      },
      autoStartBreaks: {
        desc: 'Iniciar pausas automaticamente após o tempo de foco'
      },
      resetData: {
        desc: 'Excluir dados da aplicação'
      },
      deleteSchedule: {
        btn: 'Excluir Agenda',
        desc: 'Todos os eventos da agenda foram removidos'
      },
      deleteAllData: {
        btn: 'Excluir Todos os Dados',
        desc: 'Todos os dados da aplicação foram removidos'
      },
      changesSaved: {
        desc: 'Suas configurações foram salvas com sucesso'
      }
    },
    task: {
      title: 'Tarefa',
      duration: 'Duração',
      completed: 'Concluído',
      addTask: 'Adicionar Tarefa',
    },
    revision: {
      title: 'Revisão',
      description: 'Descrição',
      addRevision: 'Adicionar Revisão',
      editRevision: 'Editar Revisão',
      deleteRevision: 'Excluir Revisão',
      nextRevisionDate: 'Próxima Revisão',
      createTitle: 'Criar Nova Revisão',
      createDescription: 'Adicione uma nova revisão ao seu sistema de estudo',
      titleLabel: 'Título',
      titlePlaceholder: 'Digite o título da revisão',
      contentLabel: 'Conteúdo',
      contentPlaceholder: 'Digite o conteúdo a ser revisado',
      subjectLabel: 'Matéria',
      subjectPlaceholder: 'Digite a matéria',
      timeLabel: 'Tempo Estimado (minutos)',
      timePlaceholder: '30',
      nonStudyDaysLabel: 'Dias de Não Estudo',
      nonStudyDaysDescription: 'Selecione os dias em que você não deseja estudar',
      create: 'Criar Revisão',
      cancel: 'Cancelar',
      forToday: 'Para Hoje',
      upcoming: 'Próximas',
      completed: 'Concluídas',
      createNew: 'Criar Nova',
      revisionsFor: 'Revisões',
      noRevisionsToday: 'Nenhuma revisão para hoje!',
      noUpcomingRevisions: 'Nenhuma revisão próxima!',
      noCompletedRevisions: 'Nenhuma revisão concluída!',
      viewContent: 'Ver Conteúdo',
      complete: 'Concluir',
      postpone: 'Adiar',
      delete: 'Excluir'
    },
    flashcards: {
      title: 'Flashcards',
      subtitle: 'Sistema de repetição espaçada para memorização eficiente',
      createDeck: 'Criar Baralho',
      createNewDeck: 'Criar Novo Baralho',
      noDeckMessage: 'Nenhum baralho criado ainda.',
      createFirstDeck: 'Crie seu primeiro baralho de flashcards para começar a estudar!',
      cards: 'cartões',
      study: 'Estudar',
      edit: 'Editar',
      delete: 'Excluir',
      import: 'Importar Baralho',
      export: 'Exportar',
      importDeck: 'Importar Baralho',
      deckName: 'Nome do Baralho',
      deckNamePlaceholder: 'Digite o nome do baralho',
      deckDescription: 'Descrição do Baralho',
      deckDescriptionPlaceholder: 'Digite uma descrição para o baralho',
      loading: 'Carregando...',
      confirmDelete: 'Tem certeza que deseja excluir este baralho?',
      totalDecks: 'Total de Baralhos',
      totalCards: 'Total de Cards',
      toReview: 'Para Revisar',
      toReviewShort: 'revisar',
      searchDecks: 'Buscar baralhos...',
      myDecks: 'Meus Baralhos',
      noDecksFound: 'Nenhum baralho encontrado.',
      noDecksCreate: 'Nenhum baralho criado ainda.',
      cardsToReview: 'cards para revisar',
      deckNotFound: 'Baralho não encontrado',
      noCardsToReview: 'Nenhum card para revisar',
      exit: 'Sair',
      of: 'de',
      studied: 'Estudados',
      restart: 'Reiniciar',
      reviews: 'Revisões',
      ease: 'Facilidade',
      clickToReveal: 'Clique para revelar',
      howWasAnswer: 'Como foi sua resposta?',
      forgot: 'Esqueci',
      hard: 'Difícil',
      good: 'Bom',
      easy: 'Fácil',
      studyComplete: 'Estudo completo!',
      studiedCards: 'Cards estudados',
      learning: 'Aprendendo',
      reviewing: 'Revisando',
      learned: 'Aprendido',
      unknown: 'Desconhecido',
      confirmRestartStudies: 'Tem certeza que deseja reiniciar todos os estudos? Isso irá resetar o progresso de todos os cards.',
      noCardsInCategory: 'Nenhum card nesta categoria',
      addNewCard: 'Adicionar Novo Card',
      frontCard: 'Frente do Card',
      frontCardPlaceholder: 'Digite a pergunta ou termo...',
      backCard: 'Verso do Card',
      backCardPlaceholder: 'Digite a resposta ou definição...',
      addCard: 'Adicionar Card',
      restartStudies: 'Reiniciar Estudos',
      interval: 'Intervalo'
    },
    profile: {
      title: 'Perfil',
      personalInfo: {
        desc: 'Gerencie suas informações pessoais e configurações de conta'
      },
      firstName: {
        placeholder: 'Digite seu nome'
      },
      lastName: {
        placeholder: 'Digite seu sobrenome'
      },
      email: {
        placeholder: 'Digite seu email'
      }
    },
    days: {
      sunday: 'Domingo',
      monday: 'Segunda-feira',
      tuesday: 'Terça-feira',
      wednesday: 'Quarta-feira',
      thursday: 'Quinta-feira',
      friday: 'Sexta-feira',
      saturday: 'Sábado'
    }
  },
  en: {
    common: {
      locale: 'en-US',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      optional: 'Optional',
      back: 'Back',
    },
    dashboard: {
      title: 'Dashboard',
      todayTasks: 'Today\'s Revisions',
      dailyProgress: 'Daily Progress',
      weeklyProgress: 'Weekly Progress',
      noTasksToday: 'No tasks for today!',
      noRevisionsToday: 'No revisions for today!',
      start: 'Start',
      complete: 'Complete',
      postpone: 'Postpone',
      tasks: 'tasks'
    },
    event: {
      title: 'Event',
      description: 'Description',
      startTime: 'Start Time',
      endTime: 'End Time',
      customColor: 'Color',
      addEvent: 'Add Event',
      editEvent: 'Edit Event',
      deleteEvent: 'Delete Event',
      weekdays: {
        sun: 'Sun',
        mon: 'Mon',
        tue: 'Tue',
        wed: 'Wed',
        thu: 'Thu',
        fri: 'Fri',
        sat: 'Sat'
      }
    },
    schedule: {
      title: 'Schedule',
      createEvent: 'Create Event',
      today: 'Today',
      day: 'Day',
      week: 'Week',
      month: 'Month'
    },
    settings: {
      title: 'Settings',
      appearance: 'Appearance',
      darkMode: 'Dark Mode',
      language: 'Language',
      notifications: 'Notifications',
      pushNotifications: 'Push Notifications',
      studyReminders: 'Study Reminders',
      pomodoro: 'Pomodoro',
      focusTime: 'Focus Time',
      shortBreak: 'Short Break',
      longBreak: 'Long Break',
      longBreakInterval: 'Long Break Interval',
      autoStartBreaks: 'Auto Start Breaks',
      resetData: 'Reset Data',
      deleteSchedule: 'Delete Schedule',
      deleteAllData: 'Delete All Data',
      scheduleDeleted: 'Schedule deleted',
      allDataDeleted: 'All data deleted',
      changesSaved: 'Changes saved',
      appearance: {
        desc: 'Customize the application appearance'
      },
      darkMode: {
        desc: 'Toggle between light and dark theme'
      },
      language: {
        placeholder: 'Select a language'
      },
      notifications: {
        desc: 'Configure your notification preferences'
      },
      pushNotifications: {
        desc: 'Receive notifications on your device'
      },
      studyReminders: {
        desc: 'Receive reminders to study'
      },
      pomodoro: {
        desc: 'Configure Pomodoro timers'
      },
      autoStartBreaks: {
        desc: 'Automatically start breaks after focus time'
      },
      resetData: {
        desc: 'Delete application data'
      },
      deleteSchedule: {
        btn: 'Delete Schedule',
        desc: 'All schedule events have been removed'
      },
      deleteAllData: {
        btn: 'Delete All Data',
        desc: 'All application data has been removed'
      },
      changesSaved: {
        desc: 'Your settings have been saved successfully'
      }
    },
    task: {
      title: 'Task',
      duration: 'Duration',
      completed: 'Completed',
      addTask: 'Add Task',
    },
    revision: {
      title: 'Revision',
      description: 'Description',
      addRevision: 'Add Revision',
      editRevision: 'Edit Revision',
      deleteRevision: 'Delete Revision',
      nextRevisionDate: 'Next Revision',
      createTitle: 'Create New Revision',
      createDescription: 'Add a new revision to your study system',
      titleLabel: 'Title',
      titlePlaceholder: 'Enter revision title',
      contentLabel: 'Content',
      contentPlaceholder: 'Enter content to be reviewed',
      subjectLabel: 'Subject',
      subjectPlaceholder: 'Enter subject',
      timeLabel: 'Estimated Time (minutes)',
      timePlaceholder: '30',
      nonStudyDaysLabel: 'Non-Study Days',
      nonStudyDaysDescription: 'Select days when you don\'t want to study',
      create: 'Create Revision',
      cancel: 'Cancel',
      forToday: 'For Today',
      upcoming: 'Upcoming',
      completed: 'Completed',
      createNew: 'Create New',
      revisionsFor: 'Revisions',
      noRevisionsToday: 'No revisions for today!',
      noUpcomingRevisions: 'No upcoming revisions!',
      noCompletedRevisions: 'No completed revisions!',
      viewContent: 'View Content',
      complete: 'Complete',
      postpone: 'Postpone',
      delete: 'Delete'
    },
    flashcards: {
      title: 'Flashcards',
      subtitle: 'Spaced repetition system for efficient memorization',
      createDeck: 'Create Deck',
      createNewDeck: 'Create New Deck',
      noDeckMessage: 'No decks created yet.',
      createFirstDeck: 'Create your first flashcard deck to start studying!',
      cards: 'cards',
      study: 'Study',
      edit: 'Edit',
      delete: 'Delete',
      import: 'Import',
      export: 'Export',
      importDeck: 'Import Deck',
      deckName: 'Deck Name',
      deckNamePlaceholder: 'Enter deck name',
      deckDescription: 'Deck Description',
      deckDescriptionPlaceholder: 'Enter deck description',
      loading: 'Loading...',
      confirmDelete: 'Are you sure you want to delete this deck?',
      totalDecks: 'Total Decks',
      totalCards: 'Total Cards',
      toReview: 'To Review',
      toReviewShort: 'to review',
      searchDecks: 'Search decks...',
      myDecks: 'My Decks',
      noDecksFound: 'No decks found.',
      noDecksCreate: 'No decks created yet.',
      cardsToReview: 'cards to review',
      deckNotFound: 'Deck not found',
      noCardsToReview: 'No cards to review',
      exit: 'Exit',
      of: 'of',
      studied: 'Studied',
      restart: 'Restart',
      reviews: 'Reviews',
      ease: 'Ease',
      clickToReveal: 'Click to reveal',
      howWasAnswer: 'How was your answer?',
      forgot: 'Forgot',
      hard: 'Hard',
      good: 'Good',
      easy: 'Easy',
      studyComplete: 'Study complete!',
      studiedCards: 'Studied cards',
      learning: 'Learning',
      reviewing: 'Revising',
      learned: 'Learned',
      unknown: 'Unknown',
      confirmRestartStudies: 'Are you sure you want to restart all studies? This will reset the progress of all cards.',
      noCardsInCategory: 'No cards in this category',
      addNewCard: 'Add New Card',
      frontCard: 'Front Card',
      frontCardPlaceholder: 'Enter question or term...',
      backCard: 'Back Card',
      backCardPlaceholder: 'Enter answer or definition...',
      addCard: 'Add Card',
      restartStudies: 'Restart Studies',
      interval: 'Interval'
    },
    profile: {
      title: 'Profile',
      personalInfo: {
        desc: 'Manage your personal information and account settings'
      },
      firstName: {
        placeholder: 'Enter your first name'
      },
      lastName: {
        placeholder: 'Enter your last name'
      },
      email: {
        placeholder: 'Enter your email'
      }
    },
    days: {
      sunday: 'Sunday',
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday'
    }
  },
  es: {
    common: {
      locale: 'es-ES',
      save: 'Guardar',
      cancel: 'Cancelar',
      edit: 'Editar',
      delete: 'Eliminar',
      optional: 'Opcional',
      back: 'Volver',
    },
    dashboard: {
      title: 'Dashboard',
      todayTasks: 'Revisiones de Hoy',
      dailyProgress: 'Progreso Diario',
      weeklyProgress: 'Progreso Semanal',
      noTasksToday: '¡No hay tareas para hoy!',
      noRevisionsToday: '¡No hay revisiones para hoy!',
      start: 'Empezar',
      complete: 'Completar',
      postpone: 'Posponer',
      tasks: 'tareas'
    },
    event: {
      title: 'Evento',
      description: 'Descripción',
      startTime: 'Hora de Inicio',
      endTime: 'Hora de Fin',
      customColor: 'Color',
      addEvent: 'Agregar Evento',
      editEvent: 'Editar Evento',
      deleteEvent: 'Eliminar Evento',
      weekdays: {
        sun: 'Dom',
        mon: 'Lun',
        tue: 'Mar',
        wed: 'Mié',
        thu: 'Jue',
        fri: 'Vie',
        sat: 'Sáb'
      }
    },
    schedule: {
      title: 'Agenda',
      createEvent: 'Crear Evento',
      today: 'Hoy',
      day: 'Día',
      week: 'Semana',
      month: 'Mes'
    },
    settings: {
      title: 'Configuración',
      appearance: 'Apariencia',
      darkMode: 'Modo Oscuro',
      language: 'Idioma',
      notifications: 'Notificaciones',
      pushNotifications: 'Notificaciones Push',
      studyReminders: 'Recordatorios de Estudio',
      pomodoro: 'Pomodoro',
      focusTime: 'Tiempo de Enfoque',
      shortBreak: 'Pausa Corta',
      longBreak: 'Pausa Larga',
      longBreakInterval: 'Intervalo de Pausa Larga',
      autoStartBreaks: 'Iniciar Pausas Automáticamente',
      resetData: 'Restablecer Datos',
      deleteSchedule: 'Eliminar Agenda',
      deleteAllData: 'Eliminar Todos los Datos',
      scheduleDeleted: 'Agenda eliminada',
      allDataDeleted: 'Todos los datos eliminados',
      changesSaved: 'Cambios guardados',
      appearance: {
        desc: 'Personalizar la apariencia de la aplicación'
      },
      darkMode: {
        desc: 'Alternar entre tema claro y oscuro'
      },
      language: {
        placeholder: 'Seleccionar un idioma'
      },
      notifications: {
        desc: 'Configurar las preferencias de notificación'
      },
      pushNotifications: {
        desc: 'Recibir notificaciones en el dispositivo'
      },
      studyReminders: {
        desc: 'Recibir recordatorios para estudiar'
      },
      pomodoro: {
        desc: 'Configurar los temporizadores Pomodoro'
      },
      autoStartBreaks: {
        desc: 'Iniciar pausas automáticamente después del tiempo de enfoque'
      },
      resetData: {
        desc: 'Eliminar datos de la aplicación'
      },
      deleteSchedule: {
        btn: 'Eliminar Agenda',
        desc: 'Todos los eventos de la agenda han sido eliminados'
      },
      deleteAllData: {
        btn: 'Eliminar Todos los Datos',
        desc: 'Todos los datos de la aplicación han sido eliminados'
      },
      changesSaved: {
        desc: 'Sus configuraciones han sido guardadas exitosamente'
      }
    },
    task: {
      title: 'Tarea',
      duration: 'Duración',
      completed: 'Completado',
      addTask: 'Agregar Tarea',
    },
    revision: {
      title: 'Revisión',
      description: 'Descripción',
      addRevision: 'Agregar Revisión',
      editRevision: 'Editar Revisión',
      deleteRevision: 'Eliminar Revisión',
      nextRevisionDate: 'Próxima Revisión',
      createTitle: 'Crear Nueva Revisión',
      createDescription: 'Agregar una nueva revisión a tu sistema de estudio',
      titleLabel: 'Título',
      titlePlaceholder: 'Ingresa el título de la revisión',
      contentLabel: 'Contenido',
      contentPlaceholder: 'Ingresa el contenido a revisar',
      subjectLabel: 'Materia',
      subjectPlaceholder: 'Ingresa la materia',
      timeLabel: 'Tiempo Estimado (minutos)',
      timePlaceholder: '30',
      nonStudyDaysLabel: 'Días de No Estudio',
      nonStudyDaysDescription: 'Selecciona los días en que no deseas estudiar',
      create: 'Crear Revisión',
      cancel: 'Cancelar',
      forToday: 'Para Hoy',
      upcoming: 'Próximas',
      completed: 'Completadas',
      createNew: 'Crear Nueva',
      revisionsFor: 'Revisiones',
      noRevisionsToday: '¡No hay revisiones para hoy!',
      noUpcomingRevisions: '¡No hay revisiones próximas!',
      noCompletedRevisions: '¡No hay revisiones completadas!',
      viewContent: 'Ver Contenido',
      complete: 'Completar',
      postpone: 'Posponer',
      delete: 'Eliminar'
    },
    flashcards: {
      title: 'Flashcards',
      subtitle: 'Sistema de repetición espaciada para memorización eficiente',
      createDeck: 'Crear Mazo',
      createNewDeck: 'Crear Nuevo Mazo',
      noDeckMessage: 'No se han creado mazos aún.',
      createFirstDeck: '¡Crea tu primer mazo de flashcards para empezar a estudiar!',
      cards: 'cartas',
      study: 'Estudiar',
      edit: 'Editar',
      delete: 'Eliminar',
      import: 'Importar',
      export: 'Exportar',
      importDeck: 'Importar Mazo',
      deckName: 'Nombre del Mazo',
      deckNamePlaceholder: 'Ingresa el nombre del mazo',
      deckDescription: 'Descripción del Mazo',
      deckDescriptionPlaceholder: 'Ingresa una descripción para el mazo',
      loading: 'Cargando...',
      confirmDelete: '¿Estás seguro de que quieres eliminar este mazo?',
      totalDecks: 'Total de Mazos',
      totalCards: 'Total de Cartas',
      toReview: 'Para Revisar',
      toReviewShort: 'revisar',
      searchDecks: 'Buscar mazos...',
      myDecks: 'Mis Mazos',
      noDecksFound: 'No se encontraron mazos.',
      noDecksCreate: 'No se han creado mazos aún.',
      cardsToReview: 'cartas para revisar',
      deckNotFound: 'Mazo no encontrado',
      noCardsToReview: 'No hay cartas para revisar',
      exit: 'Salir',
      of: 'de',
      studied: 'Estudiadas',
      restart: 'Reiniciar',
      reviews: 'Revisiones',
      ease: 'Facilidad',
      clickToReveal: 'Clic para revelar',
      howWasAnswer: '¿Cómo fue tu respuesta?',
      forgot: 'Olvidé',
      hard: 'Difícil',
      good: 'Bueno',
      easy: 'Fácil',
      studyComplete: '¡Estudio completo!',
      studiedCards: 'Cartas estudiadas',
      learning: 'Aprendiendo',
      reviewing: 'Revisando',
      learned: 'Aprendido',
      unknown: 'Desconocido',
      confirmRestartStudies: '¿Estás seguro de que quieres reiniciar todos los estudios? Esto restablecerá el progreso de todas las cartas.',
      noCardsInCategory: 'No hay cartas en esta categoría',
      addNewCard: 'Agregar Nueva Carta',
      frontCard: 'Frente de la Carta',
      frontCardPlaceholder: 'Ingresa pregunta o término...',
      backCard: 'Reverso de la Carta',
      backCardPlaceholder: 'Ingresa respuesta o definición...',
      addCard: 'Agregar Carta',
      restartStudies: 'Reiniciar Estudios',
      interval: 'Intervalo'
    },
    profile: {
      title: 'Perfil',
      personalInfo: {
        desc: 'Gestiona tu información personal y configuraciones de cuenta'
      },
      firstName: {
        placeholder: 'Ingresa tu nombre'
      },
      lastName: {
        placeholder: 'Ingresa tu apellido'
      },
      email: {
        placeholder: 'Ingresa tu email'
      }
    },
    days: {
      sunday: 'Domingo',
      monday: 'Lunes',
      tuesday: 'Martes',
      wednesday: 'Miércoles',
      thursday: 'Jueves',      
      friday: 'Viernes',
      saturday: 'Sábado'
    }
  }
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<string>('pt');

  const t = useCallback((key: string): string => {
    console.log('🔍 Translation requested for key:', key, 'Language:', language);
    
    const keys = key.split('.');
    const currentTranslations = translations[language as keyof typeof translations];
    
    if (!currentTranslations) {
      console.log('❌ No translations found for language:', language);
      return key;
    }
    
    let value: string | Translation = currentTranslations;
  
    for (const k of keys) {
      console.log('🔎 Processing key part:', k, 'Current value type:', typeof value);
      
      if (typeof value === 'string') {
        console.log('❌ Value is string, but still have keys to process:', k);
        return key;
      }
      
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
        console.log('✅ Found key:', k, 'New value:', typeof value === 'string' ? value : 'object');
      } else {
        console.log('❌ Key not found:', k, 'Available keys:', Object.keys(value || {}));
        return key;
      }
    }
  
    if (typeof value === 'string') {
      console.log('✅ Translation found:', value);
      return value;
    }
  
    console.log('❌ Final value is not string:', value);
    return key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
