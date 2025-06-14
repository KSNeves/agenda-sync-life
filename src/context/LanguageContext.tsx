
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
      system: 'Sistema'
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
      system: 'System'
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
      system: 'Sistema'
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
    }
  }
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<string>('pt');

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let value: string | Translation = translations[language as keyof typeof translations];
  
    for (const k of keys) {
      if (typeof value === 'string') {
        return value;
      }
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }
  
    if (typeof value === 'string') {
      return value;
    }
  
    return key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
