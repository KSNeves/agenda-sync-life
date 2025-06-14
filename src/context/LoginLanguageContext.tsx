
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type LoginLanguage = 'pt' | 'en' | 'es';

interface LoginLanguageContextType {
  language: LoginLanguage;
  setLanguage: (lang: LoginLanguage) => void;
  t: (key: string) => string;
}

const loginTranslations = {
  pt: {
    auth: {
      welcomeBack: 'Bem-vindo de volta',
      welcomeBackDesc: 'Faça login em sua conta para continuar',
      createAccount: 'Criar conta',
      createAccountDesc: 'Crie uma nova conta para começar',
      email: 'E-mail',
      emailPlaceholder: 'Digite seu e-mail...',
      password: 'Senha',
      passwordPlaceholder: 'Digite sua senha...',
      firstName: 'Nome',
      firstNamePlaceholder: 'Digite seu nome...',
      lastName: 'Sobrenome',
      lastNamePlaceholder: 'Digite seu sobrenome...',
      login: 'Entrar',
      register: 'Cadastrar',
      alreadyHaveAccount: 'Já tem uma conta?',
      dontHaveAccount: 'Não tem uma conta?',
      clickHere: 'Clique aqui',
      language: 'Idioma'
    }
  },
  en: {
    auth: {
      welcomeBack: 'Welcome back',
      welcomeBackDesc: 'Sign in to your account to continue',
      createAccount: 'Create account',
      createAccountDesc: 'Create a new account to get started',
      email: 'Email',
      emailPlaceholder: 'Enter your email...',
      password: 'Password',
      passwordPlaceholder: 'Enter your password...',
      firstName: 'First Name',
      firstNamePlaceholder: 'Enter your first name...',
      lastName: 'Last Name',
      lastNamePlaceholder: 'Enter your last name...',
      login: 'Sign In',
      register: 'Sign Up',
      alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: 'Don\'t have an account?',
      clickHere: 'Click here',
      language: 'Language'
    }
  },
  es: {
    auth: {
      welcomeBack: 'Bienvenido de vuelta',
      welcomeBackDesc: 'Inicia sesión en tu cuenta para continuar',
      createAccount: 'Crear cuenta',
      createAccountDesc: 'Crea una nueva cuenta para empezar',
      email: 'Correo electrónico',
      emailPlaceholder: 'Ingresa tu correo...',
      password: 'Contraseña',
      passwordPlaceholder: 'Ingresa tu contraseña...',
      firstName: 'Nombre',
      firstNamePlaceholder: 'Ingresa tu nombre...',
      lastName: 'Apellido',
      lastNamePlaceholder: 'Ingresa tu apellido...',
      login: 'Iniciar sesión',
      register: 'Registrarse',
      alreadyHaveAccount: '¿Ya tienes una cuenta?',
      dontHaveAccount: '¿No tienes una cuenta?',
      clickHere: 'Haz clic aquí',
      language: 'Idioma'
    }
  }
};

const LoginLanguageContext = createContext<LoginLanguageContextType | undefined>(undefined);

export function LoginLanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<LoginLanguage>(() => {
    const saved = localStorage.getItem('loginLanguage');
    return (saved as LoginLanguage) || 'pt';
  });

  useEffect(() => {
    localStorage.setItem('loginLanguage', language);
  }, [language]);

  const t = (key: string): string => {
    const keys = key.split('.');
    let current: any = loginTranslations[language];
    
    for (const keyPart of keys) {
      if (current && typeof current === 'object' && keyPart in current) {
        current = current[keyPart];
      } else {
        return key;
      }
    }
    
    return typeof current === 'string' ? current : key;
  };

  return (
    <LoginLanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LoginLanguageContext.Provider>
  );
}

export function useLoginLanguage() {
  const context = useContext(LoginLanguageContext);
  if (!context) {
    throw new Error('useLoginLanguage must be used within a LoginLanguageProvider');
  }
  return context;
}
