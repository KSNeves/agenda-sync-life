import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'pt' | 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translations: Record<string, any>;
  t: (path: string) => string;
}

const translations = {
  pt: {
    common: {
      locale: 'pt-BR'
    },
    auth: {
      welcome: 'Bem-vindo',
      loginDescription: 'Entre na sua conta para continuar',
      registerDescription: 'Crie uma conta para começar',
      name: 'Nome',
      namePlaceholder: 'Digite seu nome completo',
      nameRequired: 'Nome é obrigatório',
      email: 'Email',
      emailPlaceholder: 'Digite seu email',
      password: 'Senha',
      passwordPlaceholder: 'Digite sua senha (mín. 6 caracteres)',
      login: 'Entrar',
      register: 'Cadastrar',
      loading: 'Carregando...',
      loginError: 'Email ou senha incorretos',
      emailExists: 'Este email já está cadastrado',
      switchToRegister: 'Não tem conta? Cadastre-se',
      switchToLogin: 'Já tem conta? Entre aqui'
    },
    navigation: {
      dashboard: 'Painel',
      schedule: 'Cronograma', 
      revision: 'Revisão',
      profile: 'Perfil',
      settings: 'Configurações',
      language: 'Idioma',
      logout: 'Sair'
    },
    dashboard: {
      title: 'Painel',
      todayTasks: 'Tarefas de Hoje',
      noRevisionsToday: 'Nenhuma revisão para hoje! 🎉',
      start: 'Iniciar',
      complete: 'Concluir',
      postpone: 'Adiar',
      dailyProgress: 'Progresso Diário',
      weeklyProgress: 'Progresso Semanal',
      tasks: 'tarefas'
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
    flashcards: {
      title: 'Flashcards',
      myDecks: 'Meus Baralhos',
      createDeck: 'Criar Baralho',
      importDeck: 'Importar Baralho',
      noDeck: 'Nenhum baralho encontrado',
      createFirst: 'Crie seu primeiro baralho de flashcards',
      cards: 'cartas',
      study: 'Estudar',
      edit: 'Editar',
      delete: 'Excluir',
      addCard: 'Adicionar Carta',
      front: 'Frente',
      back: 'Verso',
      save: 'Salvar',
      cancel: 'Cancelar',
      showAnswer: 'Mostrar Resposta',
      nextCard: 'Próxima Carta',
      again: 'Novamente',
      hard: 'Difícil', 
      good: 'Bom',
      easy: 'Fácil',
      studyComplete: 'Estudo Concluído!',
      backToDecks: 'Voltar aos Baralhos',
      confirmDelete: 'Tem certeza que deseja excluir este baralho?',
      deleteConfirm: 'Sim, excluir',
      progress: 'Progresso',
      newCards: 'Novas',
      learning: 'Aprendendo',
      review: 'Revisão'
    }
  },
  en: {
    common: {
      locale: 'en-US'
    },
    auth: {
      welcome: 'Welcome',
      loginDescription: 'Sign in to your account to continue',
      registerDescription: 'Create an account to get started',
      name: 'Name',
      namePlaceholder: 'Enter your full name',
      nameRequired: 'Name is required',
      email: 'Email',
      emailPlaceholder: 'Enter your email',
      password: 'Password',
      passwordPlaceholder: 'Enter your password (min. 6 characters)',
      login: 'Sign In',
      register: 'Sign Up',
      loading: 'Loading...',
      loginError: 'Incorrect email or password',
      emailExists: 'This email is already registered',
      switchToRegister: "Don't have an account? Sign up",
      switchToLogin: 'Already have an account? Sign in'
    },
    navigation: {
      dashboard: 'Dashboard',
      schedule: 'Schedule',
      revision: 'Revision', 
      profile: 'Profile',
      settings: 'Settings',
      language: 'Language',
      logout: 'Logout'
    },
    dashboard: {
      title: 'Dashboard',
      todayTasks: "Today's Tasks",
      noRevisionsToday: 'No revisions for today! 🎉',
      start: 'Start',
      complete: 'Complete',
      postpone: 'Postpone',
      dailyProgress: 'Daily Progress',
      weeklyProgress: 'Weekly Progress',
      tasks: 'tasks'
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
    flashcards: {
      title: 'Flashcards',
      myDecks: 'My Decks',
      createDeck: 'Create Deck',
      importDeck: 'Import Deck',
      noDeck: 'No decks found',
      createFirst: 'Create your first flashcard deck',
      cards: 'cards',
      study: 'Study',
      edit: 'Edit',
      delete: 'Delete',
      addCard: 'Add Card',
      front: 'Front',
      back: 'Back',
      save: 'Save',
      cancel: 'Cancel',
      showAnswer: 'Show Answer',
      nextCard: 'Next Card',
      again: 'Again',
      hard: 'Hard',
      good: 'Good', 
      easy: 'Easy',
      studyComplete: 'Study Complete!',
      backToDecks: 'Back to Decks',
      confirmDelete: 'Are you sure you want to delete this deck?',
      deleteConfirm: 'Yes, delete',
      progress: 'Progress',
      newCards: 'New',
      learning: 'Learning',
      review: 'Review'
    }
  },
  es: {
    common: {
      locale: 'es-ES'
    },
    auth: {
      welcome: 'Bienvenido',
      loginDescription: 'Inicia sesión en tu cuenta para continuar',
      registerDescription: 'Crea una cuenta para comenzar',
      name: 'Nombre',
      namePlaceholder: 'Ingresa tu nombre completo',
      nameRequired: 'El nombre es obligatorio',
      email: 'Email',
      emailPlaceholder: 'Ingresa tu email',
      password: 'Contraseña',
      passwordPlaceholder: 'Ingresa tu contraseña (mín. 6 caracteres)',
      login: 'Iniciar Sesión',
      register: 'Registrarse',
      loading: 'Cargando...',
      loginError: 'Email o contraseña incorrectos',
      emailExists: 'Este email ya está registrado',
      switchToRegister: '¿No tienes cuenta? Regístrate',
      switchToLogin: '¿Ya tienes cuenta? Inicia sesión'
    },
    navigation: {
      dashboard: 'Panel',
      schedule: 'Horario',
      revision: 'Revisión',
      profile: 'Perfil', 
      settings: 'Configuración',
      language: 'Idioma',
      logout: 'Salir'
    },
    dashboard: {
      title: 'Panel',
      todayTasks: 'Tareas de Hoy',
      noRevisionsToday: '¡No hay revisiones para hoy! 🎉',
      start: 'Iniciar',
      complete: 'Completar',
      postpone: 'Posponer',
      dailyProgress: 'Progreso Diario',
      weeklyProgress: 'Progreso Semanal',
      tasks: 'tareas'
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
    flashcards: {
      title: 'Flashcards',
      myDecks: 'Mis Mazos',
      createDeck: 'Crear Mazo',
      importDeck: 'Importar Mazo',
      noDeck: 'No se encontraron mazos',
      createFirst: 'Crea tu primer mazo de flashcards',
      cards: 'cartas',
      study: 'Estudiar',
      edit: 'Editar',
      delete: 'Eliminar',
      addCard: 'Agregar Carta',
      front: 'Frente',
      back: 'Reverso',
      save: 'Guardar',
      cancel: 'Cancelar',
      showAnswer: 'Mostrar Respuesta',
      nextCard: 'Siguiente Carta',
      again: 'Otra vez',
      hard: 'Difícil',
      good: 'Bueno',
      easy: 'Fácil',
      studyComplete: '¡Estudio Completado!',
      backToDecks: 'Volver a Mazos',
      confirmDelete: '¿Estás seguro de que quieres eliminar este mazo?',
      deleteConfirm: 'Sí, eliminar',
      progress: 'Progreso',
      newCards: 'Nuevas',
      learning: 'Aprendiendo', 
      review: 'Revisión'
    }
  }
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('pt');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['pt', 'en', 'es'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (path: string): string => {
    const keys = path.split('.');
    let value = translations[language];
    
    for (const key of keys) {
      if (value && typeof value === 'object') {
        value = value[key];
      } else {
        return path; // Return the path if translation not found
      }
    }
    
    return typeof value === 'string' ? value : path;
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      translations: translations[language],
      t
    }}>
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
