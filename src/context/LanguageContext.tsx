
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
      language: 'Idioma',
      theme: 'Tema',
      light: 'Claro',
      dark: 'Escuro',
      system: 'Sistema',
      appearance: 'Aparência',
      'appearance.desc': 'Personalize a aparência da aplicação',
      darkMode: 'Modo Escuro',
      'darkMode.desc': 'Alternar entre tema claro e escuro',
      'language.placeholder': 'Selecione um idioma',
      notifications: 'Notificações',
      'notifications.desc': 'Configure suas preferências de notificação',
      pushNotifications: 'Notificações Push',
      'pushNotifications.desc': 'Receber notificações no dispositivo',
      studyReminders: 'Lembretes de Estudo',
      'studyReminders.desc': 'Receber lembretes para estudar',
      pomodoro: 'Pomodoro',
      'pomodoro.desc': 'Configure os tempos do Pomodoro',
      focusTime: 'Tempo de Foco',
      shortBreak: 'Pausa Curta',
      longBreak: 'Pausa Longa',
      longBreakInterval: 'Intervalo da Pausa Longa',
      autoStartBreaks: 'Iniciar Pausas Automaticamente',
      'autoStartBreaks.desc': 'Iniciar pausas automaticamente após o tempo de foco',
      resetData: 'Redefinir Dados',
      'resetData.desc': 'Excluir dados da aplicação',
      deleteSchedule: 'Excluir Agenda',
      'deleteSchedule.btn': 'Excluir Agenda',
      deleteAllData: 'Excluir Todos os Dados',
      'deleteAllData.btn': 'Excluir Todos os Dados',
      scheduleDeleted: 'Agenda excluída',
      'scheduleDeleted.desc': 'Todos os eventos da agenda foram removidos',
      allDataDeleted: 'Todos os dados excluídos',
      'allDataDeleted.desc': 'Todos os dados da aplicação foram removidos',
      changesSaved: 'Alterações salvas',
      'changesSaved.desc': 'Suas configurações foram salvas com sucesso'
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
      cancel: 'Cancelar'
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
      language: 'Language',
      theme: 'Theme',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
      appearance: 'Appearance',
      'appearance.desc': 'Customize the application appearance',
      darkMode: 'Dark Mode',
      'darkMode.desc': 'Toggle between light and dark theme',
      'language.placeholder': 'Select a language',
      notifications: 'Notifications',
      'notifications.desc': 'Configure your notification preferences',
      pushNotifications: 'Push Notifications',
      'pushNotifications.desc': 'Receive notifications on your device',
      studyReminders: 'Study Reminders',
      'studyReminders.desc': 'Receive reminders to study',
      pomodoro: 'Pomodoro',
      'pomodoro.desc': 'Configure Pomodoro timers',
      focusTime: 'Focus Time',
      shortBreak: 'Short Break',
      longBreak: 'Long Break',
      longBreakInterval: 'Long Break Interval',
      autoStartBreaks: 'Auto Start Breaks',
      'autoStartBreaks.desc': 'Automatically start breaks after focus time',
      resetData: 'Reset Data',
      'resetData.desc': 'Delete application data',
      deleteSchedule: 'Delete Schedule',
      'deleteSchedule.btn': 'Delete Schedule',
      deleteAllData: 'Delete All Data',
      'deleteAllData.btn': 'Delete All Data',
      scheduleDeleted: 'Schedule deleted',
      'scheduleDeleted.desc': 'All schedule events have been removed',
      allDataDeleted: 'All data deleted',
      'allDataDeleted.desc': 'All application data has been removed',
      changesSaved: 'Changes saved',
      'changesSaved.desc': 'Your settings have been saved successfully'
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
      cancel: 'Cancel'
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
      language: 'Idioma',
      theme: 'Tema',
      light: 'Claro',
      dark: 'Oscuro',
      system: 'Sistema',
      appearance: 'Apariencia',
      'appearance.desc': 'Personalizar la apariencia de la aplicación',
      darkMode: 'Modo Oscuro',
      'darkMode.desc': 'Alternar entre tema claro y oscuro',
      'language.placeholder': 'Seleccionar un idioma',
      notifications: 'Notificaciones',
      'notifications.desc': 'Configurar las preferencias de notificación',
      pushNotifications: 'Notificaciones Push',
      'pushNotifications.desc': 'Recibir notificaciones en el dispositivo',
      studyReminders: 'Recordatorios de Estudio',
      'studyReminders.desc': 'Recibir recordatorios para estudiar',
      pomodoro: 'Pomodoro',
      'pomodoro.desc': 'Configurar los temporizadores Pomodoro',
      focusTime: 'Tiempo de Enfoque',
      shortBreak: 'Pausa Corta',
      longBreak: 'Pausa Larga',
      longBreakInterval: 'Intervalo de Pausa Larga',
      autoStartBreaks: 'Iniciar Pausas Automáticamente',
      'autoStartBreaks.desc': 'Iniciar pausas automáticamente después del tiempo de enfoque',
      resetData: 'Restablecer Datos',
      'resetData.desc': 'Eliminar datos de la aplicación',
      deleteSchedule: 'Eliminar Agenda',
      'deleteSchedule.btn': 'Eliminar Agenda',
      deleteAllData: 'Eliminar Todos los Datos',
      'deleteAllData.btn': 'Eliminar Todos los Datos',
      scheduleDeleted: 'Agenda eliminada',
      'scheduleDeleted.desc': 'Todos los eventos de la agenda han sido eliminados',
      allDataDeleted: 'Todos los datos eliminados',
      'allDataDeleted.desc': 'Todos los datos de la aplicación han sido eliminados',
      changesSaved: 'Cambios guardados',
      'changesSaved.desc': 'Sus configuraciones han sido guardadas exitosamente'
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
      cancel: 'Cancelar'
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
    console.log('Translation requested for key:', key, 'Language:', language);
    
    const keys = key.split('.');
    const currentTranslations = translations[language as keyof typeof translations];
    
    if (!currentTranslations) {
      console.log('No translations found for language:', language);
      return key;
    }
    
    let value: string | Translation = currentTranslations;
  
    for (const k of keys) {
      if (typeof value === 'string') {
        console.log('Value is string, but still have keys to process:', k);
        return key;
      }
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.log('Key not found:', k, 'in value:', value);
        return key;
      }
    }
  
    if (typeof value === 'string') {
      console.log('Translation found:', value);
      return value;
    }
  
    console.log('Final value is not string:', value);
    return key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
