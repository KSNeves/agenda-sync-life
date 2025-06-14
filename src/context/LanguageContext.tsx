import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'pt' | 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  pt: {
    common: {
      locale: 'pt-BR',
      save: 'Salvar',
      cancel: 'Cancelar',
      delete: 'Excluir',
      edit: 'Editar',
      add: 'Adicionar',
      search: 'Pesquisar',
      loading: 'Carregando...',
      error: 'Erro',
      success: 'Sucesso',
      confirm: 'Confirmar',
      yes: 'Sim',
      no: 'Não',
      back: 'Voltar',
      next: 'Próximo',
      previous: 'Anterior',
      close: 'Fechar',
      open: 'Abrir',
      view: 'Visualizar',
      create: 'Criar',
      update: 'Atualizar',
      remove: 'Remover',
      select: 'Selecionar',
      clear: 'Limpar',
      apply: 'Aplicar',
      reset: 'Resetar',
      filter: 'Filtrar',
      sort: 'Ordenar',
      export: 'Exportar',
      import: 'Importar',
      print: 'Imprimir',
      help: 'Ajuda',
      settings: 'Configurações',
      profile: 'Perfil',
      logout: 'Sair',
      login: 'Entrar',
      register: 'Registrar',
      email: 'E-mail',
      password: 'Senha',
      username: 'Nome de usuário',
      name: 'Nome',
      description: 'Descrição',
      title: 'Título',
      status: 'Status',
      active: 'Ativo',
      inactive: 'Inativo',
      enabled: 'Habilitado',
      disabled: 'Desabilitado',
      public: 'Público',
      private: 'Privado',
      draft: 'Rascunho',
      published: 'Publicado',
      archived: 'Arquivado',
      date: 'Data',
      time: 'Hora',
      datetime: 'Data e Hora',
      startDate: 'Data de Início',
      endDate: 'Data de Fim',
      startTime: 'Hora de Início',
      endTime: 'Hora de Fim',
      duration: 'Duração',
      location: 'Local',
      address: 'Endereço',
      phone: 'Telefone',
      website: 'Site',
      notes: 'Notas',
      tags: 'Tags',
      category: 'Categoria',
      priority: 'Prioridade',
      high: 'Alta',
      medium: 'Média',
      low: 'Baixa',
      urgent: 'Urgente',
      normal: 'Normal',
      completed: 'Concluído',
      pending: 'Pendente',
      inProgress: 'Em Progresso',
      cancelled: 'Cancelado',
      failed: 'Falhou',
      today: 'Hoje',
      yesterday: 'Ontem',
      tomorrow: 'Amanhã',
      thisWeek: 'Esta Semana',
      nextWeek: 'Próxima Semana',
      lastWeek: 'Semana Passada',
      thisMonth: 'Este Mês',
      nextMonth: 'Próximo Mês',
      lastMonth: 'Mês Passado',
      thisYear: 'Este Ano',
      nextYear: 'Próximo Ano',
      lastYear: 'Ano Passado',
      optional: 'Opcional'
    },
    navigation: {
      dashboard: 'Painel',
      schedule: 'Agenda',
      revision: 'Revisão',
      flashcards: 'Flashcards',
      settings: 'Configurações',
      profile: 'Perfil',
      language: 'Idioma',
      logout: 'Sair'
    },
    dashboard: {
      title: 'Painel',
      todayTasks: 'Revisões de Hoje',
      noRevisionsToday: 'Nenhuma revisão para hoje!',
      dailyProgress: 'Progresso Diário',
      weeklyProgress: 'Progresso Semanal',
      tasks: 'tarefas',
      start: 'Iniciar',
      complete: 'Concluir',
      postpone: 'Adiar'
    },
    schedule: {
      createEvent: 'Criar Evento',
      today: 'Hoje',
      day: 'Dia',
      week: 'Semana',
      month: 'Mês'
    },
    weekdays: {
      sun: 'Dom',
      mon: 'Seg',
      tue: 'Ter',
      wed: 'Qua',
      thu: 'Qui',
      fri: 'Sex',
      sat: 'Sáb'
    },
    revision: {
      title: 'Revisão',
      createNew: 'Nova Revisão',
      forToday: 'Para Hoje',
      upcoming: 'Próximas',
      completed: 'Concluídas',
      revisionsFor: 'Revisões para',
      noRevisionsToday: 'Nenhuma revisão para hoje',
      noUpcomingRevisions: 'Nenhuma revisão próxima',
      noCompletedRevisions: 'Nenhuma revisão concluída',
      viewContent: 'Ver Conteúdo',
      complete: 'Concluir',
      postpone: 'Adiar'
    },
    flashcards: {
      title: 'Flashcards',
      subtitle: 'Sistema de repetição espaçada para memorização eficiente',
      createDeck: 'Criar Deck',
      createNewDeck: 'Criar Novo Deck',
      importDeck: 'Importar Deck',
      totalDecks: 'Total de Decks',
      totalCards: 'Total de Cards',
      toReview: 'Para Revisar',
      searchDecks: 'Pesquisar decks...',
      myDecks: 'Meus Decks',
      noDecksFound: 'Nenhum deck encontrado',
      noDecksCreate: 'Você ainda não criou nenhum deck. Comece criando seu primeiro!',
      cards: 'cartões',
      toReviewShort: 'revisar',
      confirmDelete: 'Tem certeza que deseja excluir este deck?',
      loading: 'Carregando...',
      deckNotFound: 'Deck não encontrado',
      noCardsToReview: 'Nenhum cartão para revisar neste deck',
      studyComplete: 'Estudo completo!',
      studiedCards: 'Cartões estudados',
      exit: 'Sair',
      of: 'de',
      studied: 'Estudados',
      restart: 'Reiniciar',
      learning: 'Aprendendo',
      reviewing: 'Revisando',
      learned: 'Aprendido',
      unknown: 'Desconhecido',
      reviews: 'Revisões',
      ease: 'Facilidade',
      clickToReveal: 'Clique para revelar a resposta',
      howWasAnswer: 'Como foi sua resposta?',
      forgot: 'Esqueci',
      hard: 'Difícil',
      good: 'Bom',
      easy: 'Fácil',
      deckName: 'Nome do Deck',
      deckNamePlaceholder: 'Digite o nome do deck...',
      deckDescription: 'Descrição do Deck',
      deckDescriptionPlaceholder: 'Digite uma descrição opcional...'
    },
    event: {
      title: 'Título',
      description: 'Descrição',
      startTime: 'Início',
      endTime: 'Fim',
      location: 'Local',
      type: 'Tipo',
      color: 'Cor',
      recurring: 'Recorrente',
      allDay: 'Dia inteiro',
      reminder: 'Lembrete',
      categories: {
        meeting: 'Reunião',
        appointment: 'Compromisso',
        task: 'Tarefa',
        event: 'Evento',
        personal: 'Pessoal',
        work: 'Trabalho',
        study: 'Estudo',
        health: 'Saúde',
        other: 'Outro'
      },
      colors: {
        blue: 'Azul',
        green: 'Verde',
        red: 'Vermelho',
        purple: 'Roxo',
        orange: 'Laranja',
        pink: 'Rosa',
        yellow: 'Amarelo',
        gray: 'Cinza'
      },
      recurrence: {
        none: 'Nenhuma',
        daily: 'Diário',
        weekly: 'Semanal',
        monthly: 'Mensal',
        yearly: 'Anual'
      },
      reminders: {
        none: 'Nenhum',
        '5min': '5 minutos antes',
        '15min': '15 minutos antes',
        '30min': '30 minutos antes',
        '1hour': '1 hora antes',
        '1day': '1 dia antes'
      }
    },
    timer: {
      focusTime: 'Tempo de Foco',
      shortBreak: 'Pausa Curta', 
      longBreak: 'Pausa Longa',
      cycle: 'Ciclo',
      of: 'de',
      pause: 'Pausar',
      continue: 'Continuar',
      nextPhase: 'Próxima Fase',
      restart: 'Reiniciar',
      completed: 'Concluído',
      autoStarting: 'iniciando automaticamente',
      running: 'Em execução',
      paused: 'Pausado',
      autoBreaksEnabled: 'Pausas automáticas habilitadas'
    },
    settings: {
      title: 'Configurações',
      appearance: {
        title: 'Aparência',
        desc: 'Personalize a aparência do aplicativo'
      },
      darkMode: {
        title: 'Modo Escuro',
        desc: 'Usar tema escuro'
      },
      language: {
        title: 'Idioma',
        placeholder: 'Selecione um idioma'
      },
      notifications: {
        title: 'Notificações',
        desc: 'Configure suas notificações'
      },
      pushNotifications: {
        title: 'Notificações Push',
        desc: 'Receber notificações push'
      },
      studyReminders: {
        title: 'Lembretes de Estudo',
        desc: 'Receber lembretes para estudar'
      },
      pomodoro: {
        title: 'Pomodoro',
        desc: 'Configure seu timer Pomodoro',
        focusTime: 'Tempo de Foco (min)',
        shortBreak: 'Pausa Curta (min)',
        longBreak: 'Pausa Longa (min)',
        longBreakInterval: 'Intervalos para Pausa Longa'
      },
      autoStartBreaks: {
        title: 'Iniciar Pausas Automaticamente',
        desc: 'Iniciar pausas automaticamente após o foco'
      },
      resetData: {
        title: 'Redefinir Dados',
        desc: 'Limpar dados do aplicativo'
      },
      deleteSchedule: {
        title: 'Excluir Agenda',
        desc: 'Todos os eventos da agenda foram removidos',
        btn: 'Excluir Agenda'
      },
      deleteAllData: {
        title: 'Excluir Todos os Dados',
        desc: 'Todos os dados foram removidos permanentemente',
        btn: 'Excluir Todos os Dados'
      },
      scheduleDeleted: 'Agenda excluída',
      allDataDeleted: 'Todos os dados excluídos',
      changesSaved: {
        title: 'Alterações salvas',
        desc: 'Suas configurações foram atualizadas'
      }
    },
    profile: {
      title: 'Perfil',
      personalInfo: {
        title: 'Informações Pessoais',
        desc: 'Gerencie suas informações pessoais'
      },
      firstName: 'Nome',
      lastName: 'Sobrenome',
      email: 'E-mail'
    }
  },
  en: {
    common: {
      locale: 'en-US',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      close: 'Close',
      open: 'Open',
      view: 'View',
      create: 'Create',
      update: 'Update',
      remove: 'Remove',
      select: 'Select',
      clear: 'Clear',
      apply: 'Apply',
      reset: 'Reset',
      filter: 'Filter',
      sort: 'Sort',
      export: 'Export',
      import: 'Import',
      print: 'Print',
      help: 'Help',
      settings: 'Settings',
      profile: 'Profile',
      logout: 'Logout',
      login: 'Login',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      username: 'Username',
      name: 'Name',
      description: 'Description',
      title: 'Title',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
      enabled: 'Enabled',
      disabled: 'Disabled',
      public: 'Public',
      private: 'Private',
      draft: 'Draft',
      published: 'Published',
      archived: 'Archived',
      date: 'Date',
      time: 'Time',
      datetime: 'DateTime',
      startDate: 'Start Date',
      endDate: 'End Date',
      startTime: 'Start Time',
      endTime: 'End Time',
      duration: 'Duration',
      location: 'Location',
      address: 'Address',
      phone: 'Phone',
      website: 'Website',
      notes: 'Notes',
      tags: 'Tags',
      category: 'Category',
      priority: 'Priority',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      urgent: 'Urgent',
      normal: 'Normal',
      completed: 'Completed',
      pending: 'Pending',
      inProgress: 'In Progress',
      cancelled: 'Cancelled',
      failed: 'Failed',
      today: 'Today',
      yesterday: 'Yesterday',
      tomorrow: 'Tomorrow',
      thisWeek: 'This Week',
      nextWeek: 'Next Week',
      lastWeek: 'Last Week',
      thisMonth: 'This Month',
      nextMonth: 'Next Month',
      lastMonth: 'Last Month',
      thisYear: 'This Year',
      nextYear: 'Next Year',
      lastYear: 'Last Year',
      optional: 'Optional'
    },
    navigation: {
      dashboard: 'Dashboard',
      schedule: 'Schedule',
      revision: 'Revision',
      flashcards: 'Flashcards',
      settings: 'Settings',
      profile: 'Profile',
      language: 'Language',
      logout: 'Logout'
    },
    dashboard: {
      title: 'Dashboard',
      todayTasks: 'Today\'s Revisions',
      noRevisionsToday: 'No revisions for today!',
      dailyProgress: 'Daily Progress',
      weeklyProgress: 'Weekly Progress',
      tasks: 'tasks',
      start: 'Start',
      complete: 'Complete',
      postpone: 'Postpone'
    },
    schedule: {
      createEvent: 'Create Event',
      today: 'Today',
      day: 'Day',
      week: 'Week',
      month: 'Month'
    },
    weekdays: {
      sun: 'Sun',
      mon: 'Mon',
      tue: 'Tue',
      wed: 'Wed',
      thu: 'Thu',
      fri: 'Fri',
      sat: 'Sat'
    },
    revision: {
      title: 'Revision',
      createNew: 'New Revision',
      forToday: 'For Today',
      upcoming: 'Upcoming',
      completed: 'Completed',
      revisionsFor: 'Revisions for',
      noRevisionsToday: 'No revisions for today',
      noUpcomingRevisions: 'No upcoming revisions',
      noCompletedRevisions: 'No completed revisions',
      viewContent: 'View Content',
      complete: 'Complete',
      postpone: 'Postpone'
    },
    flashcards: {
      title: 'Flashcards',
      subtitle: 'Spaced repetition system for efficient memorization',
      createDeck: 'Create Deck',
      createNewDeck: 'Create New Deck',
      importDeck: 'Import Deck',
      totalDecks: 'Total Decks',
      totalCards: 'Total Cards',
      toReview: 'To Review',
      searchDecks: 'Search decks...',
      myDecks: 'My Decks',
      noDecksFound: 'No decks found',
      noDecksCreate: 'You haven\'t created any decks yet. Start by creating your first one!',
      cards: 'cards',
      toReviewShort: 'to review',
      confirmDelete: 'Are you sure you want to delete this deck?',
      loading: 'Loading...',
      deckNotFound: 'Deck not found',
      noCardsToReview: 'No cards to review in this deck',
      studyComplete: 'Study complete!',
      studiedCards: 'Cards studied',
      exit: 'Exit',
      of: 'of',
      studied: 'Studied',
      restart: 'Restart',
      learning: 'Learning',
      reviewing: 'Reviewing',
      learned: 'Learned',
      unknown: 'Unknown',
      reviews: 'Reviews',
      ease: 'Ease',
      clickToReveal: 'Click to reveal answer',
      howWasAnswer: 'How was your answer?',
      forgot: 'Forgot',
      hard: 'Hard',
      good: 'Good',
      easy: 'Easy',
      deckName: 'Deck Name',
      deckNamePlaceholder: 'Enter deck name...',
      deckDescription: 'Deck Description',
      deckDescriptionPlaceholder: 'Enter optional description...'
    },
    event: {
      title: 'Title',
      description: 'Description',
      startTime: 'Start Time',
      endTime: 'End Time',
      location: 'Location',
      type: 'Type',
      color: 'Color',
      recurring: 'Recurring',
      allDay: 'All Day',
      reminder: 'Reminder',
      categories: {
        meeting: 'Meeting',
        appointment: 'Appointment',
        task: 'Task',
        event: 'Event',
        personal: 'Personal',
        work: 'Work',
        study: 'Study',
        health: 'Health',
        other: 'Other'
      },
      colors: {
        blue: 'Blue',
        green: 'Green',
        red: 'Red',
        purple: 'Purple',
        orange: 'Orange',
        pink: 'Pink',
        yellow: 'Yellow',
        gray: 'Gray'
      },
      recurrence: {
        none: 'None',
        daily: 'Daily',
        weekly: 'Weekly',
        monthly: 'Monthly',
        yearly: 'Yearly'
      },
      reminders: {
        none: 'None',
        '5min': '5 minutes before',
        '15min': '15 minutes before',
        '30min': '30 minutes before',
        '1hour': '1 hour before',
        '1day': '1 day before'
      }
    },
    timer: {
      focusTime: 'Focus Time',
      shortBreak: 'Short Break',
      longBreak: 'Long Break',
      cycle: 'Cycle',
      of: 'of',
      pause: 'Pause',
      continue: 'Continue',
      nextPhase: 'Next Phase',
      restart: 'Restart',
      completed: 'Completed',
      autoStarting: 'auto starting',
      running: 'Running',
      paused: 'Paused',
      autoBreaksEnabled: 'Auto breaks enabled'
    },
    settings: {
      title: 'Settings',
      appearance: {
        title: 'Appearance',
        desc: 'Customize the app appearance'
      },
      darkMode: {
        title: 'Dark Mode',
        desc: 'Use dark theme'
      },
      language: {
        title: 'Language',
        placeholder: 'Select a language'
      },
      notifications: {
        title: 'Notifications',
        desc: 'Configure your notifications'
      },
      pushNotifications: {
        title: 'Push Notifications',
        desc: 'Receive push notifications'
      },
      studyReminders: {
        title: 'Study Reminders',
        desc: 'Receive study reminders'
      },
      pomodoro: {
        title: 'Pomodoro',
        desc: 'Configure your Pomodoro timer',
        focusTime: 'Focus Time (min)',
        shortBreak: 'Short Break (min)',
        longBreak: 'Long Break (min)',
        longBreakInterval: 'Long Break Interval'
      },
      autoStartBreaks: {
        title: 'Auto Start Breaks',
        desc: 'Automatically start breaks after focus'
      },
      resetData: {
        title: 'Reset Data',
        desc: 'Clear application data'
      },
      deleteSchedule: {
        title: 'Delete Schedule',
        desc: 'All schedule events have been removed',
        btn: 'Delete Schedule'
      },
      deleteAllData: {
        title: 'Delete All Data',
        desc: 'All data has been permanently removed',
        btn: 'Delete All Data'
      },
      scheduleDeleted: 'Schedule deleted',
      allDataDeleted: 'All data deleted',
      changesSaved: {
        title: 'Changes saved',
        desc: 'Your settings have been updated'
      }
    },
    profile: {
      title: 'Profile',
      personalInfo: {
        title: 'Personal Information',
        desc: 'Manage your personal information'
      },
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email'
    }
  },
  es: {
    common: {
      locale: 'es-ES',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      add: 'Añadir',
      search: 'Buscar',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      confirm: 'Confirmar',
      yes: 'Sí',
      no: 'No',
      back: 'Atrás',
      next: 'Siguiente',
      previous: 'Anterior',
      close: 'Cerrar',
      open: 'Abrir',
      view: 'Ver',
      create: 'Crear',
      update: 'Actualizar',
      remove: 'Eliminar',
      select: 'Seleccionar',
      clear: 'Limpiar',
      apply: 'Aplicar',
      reset: 'Restablecer',
      filter: 'Filtrar',
      sort: 'Ordenar',
      export: 'Exportar',
      import: 'Importar',
      print: 'Imprimir',
      help: 'Ayuda',
      settings: 'Configuración',
      profile: 'Perfil',
      logout: 'Cerrar sesión',
      login: 'Iniciar sesión',
      register: 'Registrar',
      email: 'Correo electrónico',
      password: 'Contraseña',
      username: 'Nombre de usuario',
      name: 'Nombre',
      description: 'Descripción',
      title: 'Título',
      status: 'Estado',
      active: 'Activo',
      inactive: 'Inactivo',
      enabled: 'Habilitado',
      disabled: 'Deshabilitado',
      public: 'Público',
      private: 'Privado',
      draft: 'Borrador',
      published: 'Publicado',
      archived: 'Archivado',
      date: 'Fecha',
      time: 'Hora',
      datetime: 'Fecha y Hora',
      startDate: 'Fecha de Inicio',
      endDate: 'Fecha de Fin',
      startTime: 'Hora de Inicio',
      endTime: 'Hora de Fin',
      duration: 'Duración',
      location: 'Ubicación',
      address: 'Dirección',
      phone: 'Teléfono',
      website: 'Sitio web',
      notes: 'Notas',
      tags: 'Etiquetas',
      category: 'Categoría',
      priority: 'Prioridad',
      high: 'Alta',
      medium: 'Media',
      low: 'Baja',
      urgent: 'Urgente',
      normal: 'Normal',
      completed: 'Completado',
      pending: 'Pendiente',
      inProgress: 'En Progreso',
      cancelled: 'Cancelado',
      failed: 'Falló',
      today: 'Hoy',
      yesterday: 'Ayer',
      tomorrow: 'Mañana',
      thisWeek: 'Esta Semana',
      nextWeek: 'Próxima Semana',
      lastWeek: 'Semana Pasada',
      thisMonth: 'Este Mes',
      nextMonth: 'Próximo Mes',
      lastMonth: 'Mes Pasado',
      thisYear: 'Este Año',
      nextYear: 'Próximo Año',
      lastYear: 'Año Pasado',
      optional: 'Opcional'
    },
    navigation: {
      dashboard: 'Panel',
      schedule: 'Agenda',
      revision: 'Revisión',
      flashcards: 'Tarjetas',
      settings: 'Configuración',
      profile: 'Perfil',
      language: 'Idioma',
      logout: 'Cerrar sesión'
    },
    dashboard: {
      title: 'Panel',
      todayTasks: 'Revisiones de Hoy',
      noRevisionsToday: '¡No hay revisiones para hoy!',
      dailyProgress: 'Progreso Diario',
      weeklyProgress: 'Progreso Semanal',
      tasks: 'tareas',
      start: 'Iniciar',
      complete: 'Completar',
      postpone: 'Posponer'
    },
    schedule: {
      createEvent: 'Crear Evento',
      today: 'Hoy',
      day: 'Día',
      week: 'Semana',
      month: 'Mes'
    },
    weekdays: {
      sun: 'Dom',
      mon: 'Lun',
      tue: 'Mar',
      wed: 'Mié',
      thu: 'Jue',
      fri: 'Vie',
      sat: 'Sáb'
    },
    revision: {
      title: 'Revisión',
      createNew: 'Nueva Revisión',
      forToday: 'Para Hoy',
      upcoming: 'Próximas',
      completed: 'Completadas',
      revisionsFor: 'Revisiones para',
      noRevisionsToday: 'No hay revisiones para hoy',
      noUpcomingRevisions: 'No hay revisiones próximas',
      noCompletedRevisions: 'No hay revisiones completadas',
      viewContent: 'Ver Contenido',
      complete: 'Completar',
      postpone: 'Posponer'
    },
    flashcards: {
      title: 'Tarjetas',
      subtitle: 'Sistema de repetición espaciada para memorización eficiente',
      createDeck: 'Crear Mazo',
      createNewDeck: 'Crear Nuevo Mazo',
      importDeck: 'Importar Mazo',
      totalDecks: 'Total de Mazos',
      totalCards: 'Total de Tarjetas',
      toReview: 'Para Revisar',
      searchDecks: 'Buscar mazos...',
      myDecks: 'Mis Mazos',
      noDecksFound: 'No se encontraron mazos',
      noDecksCreate: '¡Aún no has creado ningún mazo. Comienza creando tu primero!',
      cards: 'tarjetas',
      toReviewShort: 'revisar',
      confirmDelete: '¿Estás seguro de que quieres eliminar este mazo?',
      loading: 'Cargando...',
      deckNotFound: 'Mazo no encontrado',
      noCardsToReview: 'No hay tarjetas para revisar en este mazo',
      studyComplete: '¡Estudio completo!',
      studiedCards: 'Tarjetas estudiadas',
      exit: 'Salir',
      of: 'de',
      studied: 'Estudiadas',
      restart: 'Reiniciar',
      learning: 'Aprendiendo',
      reviewing: 'Revisando',
      learned: 'Aprendido',
      unknown: 'Desconocido',
      reviews: 'Revisiones',
      ease: 'Facilidad',
      clickToReveal: 'Haz clic para revelar la respuesta',
      howWasAnswer: '¿Cómo fue tu respuesta?',
      forgot: 'Olvidé',
      hard: 'Difícil',
      good: 'Bueno',
      easy: 'Fácil',
      deckName: 'Nombre del Mazo',
      deckNamePlaceholder: 'Ingresa el nombre del mazo...',
      deckDescription: 'Descripción del Mazo',
      deckDescriptionPlaceholder: 'Ingresa una descripción opcional...'
    },
    event: {
      title: 'Título',
      description: 'Descripción',
      startTime: 'Hora de Inicio',
      endTime: 'Hora de Fin',
      location: 'Ubicación',
      type: 'Tipo',
      color: 'Color',
      recurring: 'Recurrente',
      allDay: 'Todo el día',
      reminder: 'Recordatorio',
      categories: {
        meeting: 'Reunión',
        appointment: 'Cita',
        task: 'Tarea',
        event: 'Evento',
        personal: 'Personal',
        work: 'Trabajo',
        study: 'Estudio',
        health: 'Salud',
        other: 'Otro'
      },
      colors: {
        blue: 'Azul',
        green: 'Verde',
        red: 'Rojo',
        purple: 'Morado',
        orange: 'Naranja',
        pink: 'Rosa',
        yellow: 'Amarillo',
        gray: 'Gris'
      },
      recurrence: {
        none: 'Ninguna',
        daily: 'Diario',
        weekly: 'Semanal',
        monthly: 'Mensual',
        yearly: 'Anual'
      },
      reminders: {
        none: 'Ninguno',
        '5min': '5 minutos antes',
        '15min': '15 minutos antes',
        '30min': '30 minutos antes',
        '1hour': '1 hora antes',
        '1day': '1 día antes'
      }
    },
    timer: {
      focusTime: 'Tiempo de Enfoque',
      shortBreak: 'Pausa Corta',
      longBreak: 'Pausa Larga',
      cycle: 'Ciclo',
      of: 'de',
      pause: 'Pausar',
      continue: 'Continuar',
      nextPhase: 'Siguiente Fase',
      restart: 'Reiniciar',
      completed: 'Completado',
      autoStarting: 'iniciando automáticamente',
      running: 'En ejecución',
      paused: 'Pausado',
      autoBreaksEnabled: 'Pausas automáticas habilitadas'
    },
    settings: {
      title: 'Configuración',
      appearance: {
        title: 'Apariencia',
        desc: 'Personalizar la apariencia de la aplicación'
      },
      darkMode: {
        title: 'Modo Oscuro',
        desc: 'Usar tema oscuro'
      },
      language: {
        title: 'Idioma',
        placeholder: 'Selecciona un idioma'
      },
      notifications: {
        title: 'Notificaciones',
        desc: 'Configura tus notificaciones'
      },
      pushNotifications: {
        title: 'Notificaciones Push',
        desc: 'Recibir notificaciones push'
      },
      studyReminders: {
        title: 'Recordatorios de Estudio',
        desc: 'Recibir recordatorios de estudio'
      },
      pomodoro: {
        title: 'Pomodoro',
        desc: 'Configura tu temporizador Pomodoro',
        focusTime: 'Tiempo de Enfoque (min)',
        shortBreak: 'Pausa Corta (min)',
        longBreak: 'Pausa Larga (min)',
        longBreakInterval: 'Intervalo de Pausa Larga'
      },
      autoStartBreaks: {
        title: 'Iniciar Pausas Automáticamente',
        desc: 'Iniciar pausas automáticamente después del enfoque'
      },
      resetData: {
        title: 'Restablecer Datos',
        desc: 'Limpiar datos de la aplicación'
      },
      deleteSchedule: {
        title: 'Eliminar Agenda',
        desc: 'Todos los eventos de la agenda han sido eliminados',
        btn: 'Eliminar Agenda'
      },
      deleteAllData: {
        title: 'Eliminar Todos los Datos',
        desc: 'Todos los datos han sido eliminados permanentemente',
        btn: 'Eliminar Todos los Datos'
      },
      scheduleDeleted: 'Agenda eliminada',
      allDataDeleted: 'Todos los datos eliminados',
      changesSaved: {
        title: 'Cambios guardados',
        desc: 'Tu configuración ha sido actualizada'
      }
    },
    profile: {
      title: 'Perfil',
      personalInfo: {
        title: 'Información Personal',
        desc: 'Gestiona tu información personal'
      },
      firstName: 'Nombre',
      lastName: 'Apellido',
      email: 'Correo electrónico'
    }
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'pt';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    console.info(`🔍 Translation requested for key: ${key} Language: ${language}`);
    
    const keys = key.split('.');
    let current: any = translations[language];
    
    for (const keyPart of keys) {
      console.info(`🔎 Processing key part: ${keyPart} Current value type: ${typeof current}`);
      
      if (current && typeof current === 'object' && keyPart in current) {
        current = current[keyPart];
        console.info(`✅ Found key: ${keyPart} New value: ${typeof current === 'object' ? 'object' : current}`);
      } else {
        console.warn(`❌ Translation not found for key: ${key} at part: ${keyPart}`);
        return key;
      }
    }
    
    const result = typeof current === 'string' ? current : key;
    console.info(`✅ Translation found: ${result}`);
    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
