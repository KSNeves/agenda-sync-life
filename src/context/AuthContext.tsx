
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

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
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      if (!isMounted) return;
      
      try {
        console.log('Iniciando verificação de autenticação...');
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && isMounted) {
          console.log('Sessão encontrada, carregando perfil...');
          await loadUserProfile(session.user);
        } else {
          console.log('Nenhuma sessão encontrada');
        }
      } catch (error) {
        console.error('Erro ao carregar sessão:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      
      console.log('Auth state change:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        clearUserData();
      }
      
      if (isMounted && initialized) {
        setLoading(false);
      }
    });

    // Só inicializa se ainda não foi inicializado
    if (!initialized) {
      initAuth();
    }

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [initialized]);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('Carregando perfil do usuário:', supabaseUser.id);
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (profile) {
        const userData: User = {
          id: profile.id,
          firstName: profile.first_name || 'Usuário',
          lastName: profile.last_name || 'Teste',
          email: profile.email || supabaseUser.email || ''
        };

        setUser(userData);
        
        // Armazenar dados do usuário
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userProfile', JSON.stringify({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          profileImage: null
        }));

        window.dispatchEvent(new Event('profileUpdated'));
        console.log('Perfil carregado com sucesso');
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const clearUserData = () => {
    try {
      // Limpar dados específicos do usuário
      const keysToRemove = ['user', 'userProfile'];
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Limpar dados do Supabase
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      sessionStorage.clear();
      
      window.dispatchEvent(new Event('profileUpdated'));
      console.log('Dados do usuário limpos');
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
    }
  };

  const login = async (email: string, password: string, firstName?: string, lastName?: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      if (!email || !password) {
        throw new Error('Email e senha são obrigatórios');
      }
      
      if (firstName && lastName) {
        // Registro
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName
            },
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (error) {
          console.error('Erro no registro:', error);
          return false;
        }

        console.log('Registro realizado com sucesso');
        return !!data.user;
      } else {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          console.error('Erro no login:', error);
          return false;
        }

        console.log('Login realizado com sucesso');
        return true;
      }
    } catch (error) {
      console.error('Erro na autenticação:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('Iniciando logout...');
      setLoading(true);
      
      // Limpar estado local primeiro
      setUser(null);
      clearUserData();
      
      // Fazer logout no Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro no logout do Supabase:', error);
      }
      
      console.log('Logout concluído, redirecionando...');
      
      // Forçar recarregamento da página para garantir estado limpo
      setTimeout(() => {
        window.location.href = window.location.origin;
      }, 100);
      
    } catch (error) {
      console.error('Erro no logout:', error);
      // Mesmo em caso de erro, forçar redirecionamento
      setTimeout(() => {
        window.location.href = window.location.origin;
      }, 100);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
      loading
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
