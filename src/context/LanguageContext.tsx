
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

type Language = 'pt' | 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

// Traduções
const translations = {
  pt: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.calendar': 'Calendário',
    'nav.schedule': 'Cronograma',
    'nav.revision': 'Revisão',
    'nav.flashcards': 'Flashcards',
    'nav.settings': 'Configurações',
    'nav.profile': 'Perfil',
    
    // Settings
    'settings.title': 'Configurações',
    'settings.appearance': 'Aparência',
    'settings.appearance.desc': 'Personalize a aparência do aplicativo',
    'settings.darkMode': 'Modo Escuro',
    'settings.darkMode.desc': 'Ativar tema escuro',
    'settings.language': 'Idioma',
    'settings.language.placeholder': 'Selecione o idioma',
    
    'settings.notifications': 'Notificações',
    'settings.notifications.desc': 'Configure como você quer receber notificações',
    'settings.pushNotifications': 'Notificações Push',
    'settings.pushNotifications.desc': 'Receba notificações no navegador',
    'settings.studyReminders': 'Lembretes de Estudo',
    'settings.studyReminders.desc': 'Receba lembretes para suas sessões de estudo',
    
    'settings.pomodoro': 'Configurações do Pomodoro',
    'settings.pomodoro.desc': 'Configure os tempos do seu timer Pomodoro',
    'settings.focusTime': 'Tempo de Foco (min)',
    'settings.shortBreak': 'Pausa Curta (min)',
    'settings.longBreak': 'Pausa Longa (min)',
    'settings.autoStartBreaks': 'Iniciar Pausas Automaticamente',
    'settings.autoStartBreaks.desc': 'Iniciar pausas automaticamente após cada sessão',
    
    'settings.privacy': 'Privacidade e Segurança',
    'settings.privacy.desc': 'Configure suas preferências de privacidade',
    'settings.autoBackup': 'Backup Automático',
    'settings.autoBackup.desc': 'Salvar dados automaticamente na nuvem',
    'settings.changePassword': 'Alterar Senha',
    
    'settings.resetData': 'Redefinir Dados',
    'settings.resetData.desc': 'Redefina ou exporte seus dados do aplicativo',
    'settings.exportData': 'Exportar Dados',
    'settings.exportData.btn': 'Baixar Dados em JSON',
    'settings.resetSettings': 'Redefinir Configurações',
    'settings.resetSettings.btn': 'Restaurar Padrões',
    'settings.deleteAllData': 'Apagar Todos os Dados',
    'settings.deleteAllData.btn': 'Apagar Tudo Permanentemente',
    
    'common.save': 'Salvar Alterações',
    'common.cancel': 'Cancelar',
    'common.back': 'Voltar',
    
    // Profile
    'profile.title': 'Perfil',
    'profile.personalInfo': 'Informações Pessoais',
    'profile.personalInfo.desc': 'Configure suas informações pessoais',
    'profile.firstName': 'Nome',
    'profile.firstName.placeholder': 'Seu nome',
    'profile.lastName': 'Sobrenome',
    'profile.lastName.placeholder': 'Seu sobrenome',
    'profile.email': 'Email',
    'profile.email.placeholder': 'seu@email.com',
    'profile.bio': 'Bio',
    'profile.bio.placeholder': 'Fale um pouco sobre você...',
    
    // Languages
    'language.pt': 'Português',
    'language.en': 'English',
    'language.es': 'Español',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.calendar': 'Calendar',
    'nav.schedule': 'Schedule',
    'nav.revision': 'Revision',
    'nav.flashcards': 'Flashcards',
    'nav.settings': 'Settings',
    'nav.profile': 'Profile',
    
    // Settings
    'settings.title': 'Settings',
    'settings.appearance': 'Appearance',
    'settings.appearance.desc': 'Customize the app appearance',
    'settings.darkMode': 'Dark Mode',
    'settings.darkMode.desc': 'Enable dark theme',
    'settings.language': 'Language',
    'settings.language.placeholder': 'Select language',
    
    'settings.notifications': 'Notifications',
    'settings.notifications.desc': 'Configure how you want to receive notifications',
    'settings.pushNotifications': 'Push Notifications',
    'settings.pushNotifications.desc': 'Receive notifications in browser',
    'settings.studyReminders': 'Study Reminders',
    'settings.studyReminders.desc': 'Receive reminders for your study sessions',
    
    'settings.pomodoro': 'Pomodoro Settings',
    'settings.pomodoro.desc': 'Configure your Pomodoro timer settings',
    'settings.focusTime': 'Focus Time (min)',
    'settings.shortBreak': 'Short Break (min)',
    'settings.longBreak': 'Long Break (min)',
    'settings.autoStartBreaks': 'Auto Start Breaks',
    'settings.autoStartBreaks.desc': 'Automatically start breaks after each session',
    
    'settings.privacy': 'Privacy & Security',
    'settings.privacy.desc': 'Configure your privacy preferences',
    'settings.autoBackup': 'Auto Backup',
    'settings.autoBackup.desc': 'Automatically save data to cloud',
    'settings.changePassword': 'Change Password',
    
    'settings.resetData': 'Reset Data',
    'settings.resetData.desc': 'Reset or export your app data',
    'settings.exportData': 'Export Data',
    'settings.exportData.btn': 'Download JSON Data',
    'settings.resetSettings': 'Reset Settings',
    'settings.resetSettings.btn': 'Restore Defaults',
    'settings.deleteAllData': 'Delete All Data',
    'settings.deleteAllData.btn': 'Delete Everything Permanently',
    
    'common.save': 'Save Changes',
    'common.cancel': 'Cancel',
    'common.back': 'Back',
    
    // Profile
    'profile.title': 'Profile',
    'profile.personalInfo': 'Personal Information',
    'profile.personalInfo.desc': 'Configure your personal information',
    'profile.firstName': 'First Name',
    'profile.firstName.placeholder': 'Your first name',
    'profile.lastName': 'Last Name',
    'profile.lastName.placeholder': 'Your last name',
    'profile.email': 'Email',
    'profile.email.placeholder': 'your@email.com',
    'profile.bio': 'Bio',
    'profile.bio.placeholder': 'Tell us about yourself...',
    
    // Languages
    'language.pt': 'Português',
    'language.en': 'English',
    'language.es': 'Español',
  },
  es: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.calendar': 'Calendario',
    'nav.schedule': 'Horario',
    'nav.revision': 'Revisión',
    'nav.flashcards': 'Tarjetas',
    'nav.settings': 'Configuración',
    'nav.profile': 'Perfil',
    
    // Settings
    'settings.title': 'Configuración',
    'settings.appearance': 'Apariencia',
    'settings.appearance.desc': 'Personaliza la apariencia de la aplicación',
    'settings.darkMode': 'Modo Oscuro',
    'settings.darkMode.desc': 'Activar tema oscuro',
    'settings.language': 'Idioma',
    'settings.language.placeholder': 'Seleccionar idioma',
    
    'settings.notifications': 'Notificaciones',
    'settings.notifications.desc': 'Configura cómo quieres recibir notificaciones',
    'settings.pushNotifications': 'Notificaciones Push',
    'settings.pushNotifications.desc': 'Recibir notificaciones en el navegador',
    'settings.studyReminders': 'Recordatorios de Estudio',
    'settings.studyReminders.desc': 'Recibir recordatorios para tus sesiones de estudio',
    
    'settings.pomodoro': 'Configuración de Pomodoro',
    'settings.pomodoro.desc': 'Configura los tiempos de tu temporizador Pomodoro',
    'settings.focusTime': 'Tiempo de Concentración (min)',
    'settings.shortBreak': 'Pausa Corta (min)',
    'settings.longBreak': 'Pausa Larga (min)',
    'settings.autoStartBreaks': 'Iniciar Pausas Automáticamente',
    'settings.autoStartBreaks.desc': 'Iniciar pausas automáticamente después de cada sesión',
    
    'settings.privacy': 'Privacidad y Seguridad',
    'settings.privacy.desc': 'Configura tus preferencias de privacidad',
    'settings.autoBackup': 'Respaldo Automático',
    'settings.autoBackup.desc': 'Guardar datos automáticamente en la nube',
    'settings.changePassword': 'Cambiar Contraseña',
    
    'settings.resetData': 'Restablecer Datos',
    'settings.resetData.desc': 'Restablece o exporta los datos de tu aplicación',
    'settings.exportData': 'Exportar Datos',
    'settings.exportData.btn': 'Descargar Datos en JSON',
    'settings.resetSettings': 'Restablecer Configuración',
    'settings.resetSettings.btn': 'Restaurar Valores Predeterminados',
    'settings.deleteAllData': 'Eliminar Todos los Datos',
    'settings.deleteAllData.btn': 'Eliminar Todo Permanentemente',
    
    'common.save': 'Guardar Cambios',
    'common.cancel': 'Cancelar',
    'common.back': 'Volver',
    
    // Profile
    'profile.title': 'Perfil',
    'profile.personalInfo': 'Información Personal',
    'profile.personalInfo.desc': 'Configura tu información personal',
    'profile.firstName': 'Nombre',
    'profile.firstName.placeholder': 'Tu nombre',
    'profile.lastName': 'Apellido',
    'profile.lastName.placeholder': 'Tu apellido',
    'profile.email': 'Email',
    'profile.email.placeholder': 'tu@email.com',
    'profile.bio': 'Biografía',
    'profile.bio.placeholder': 'Cuéntanos sobre ti...',
    
    // Languages
    'language.pt': 'Português',
    'language.en': 'English',
    'language.es': 'Español',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setStoredLanguage] = useLocalStorage<Language>('language', 'pt');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const setLanguage = (newLanguage: Language) => {
    setStoredLanguage(newLanguage);
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
