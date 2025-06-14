
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'pt' | 'en';

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
    },
    navigation: {
      dashboard: 'Painel',
      calendar: 'Calendário',
      schedule: 'Agenda',
      revision: 'Revisão',
      flashcards: 'Flashcards',
      settings: 'Configurações',
      profile: 'Perfil',
      darkMode: 'Modo Escuro',
      lightMode: 'Modo Claro',
      language: 'Idioma'
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
    },
    navigation: {
      dashboard: 'Dashboard',
      calendar: 'Calendar',
      schedule: 'Schedule',
      revision: 'Revision',
      flashcards: 'Flashcards',
      settings: 'Settings',
      profile: 'Profile',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      language: 'Language'
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
