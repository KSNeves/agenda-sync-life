
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, firstName?: string, lastName?: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Carregar usuário do localStorage ao inicializar
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string, firstName?: string, lastName?: string): Promise<boolean> => {
    // Simular login (em um app real, aqui seria uma chamada para API)
    const userData: User = {
      id: Date.now().toString(),
      firstName: firstName || 'Usuário',
      lastName: lastName || 'Teste',
      email
    };

    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Salvar também no formato antigo para compatibilidade
    localStorage.setItem('userProfile', JSON.stringify({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      profileImage: null
    }));

    // Disparar evento para atualizar outros componentes
    window.dispatchEvent(new Event('profileUpdated'));
    
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userProfile');
    window.dispatchEvent(new Event('profileUpdated'));
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
