
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

  useEffect(() => {
    // Verificar se há uma sessão ativa
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await loadUserProfile(session.user);
        }
      } catch (error) {
        console.error('Erro ao carregar sessão:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        // Limpar dados locais antigos
        localStorage.removeItem('user');
        localStorage.removeItem('userProfile');
        window.dispatchEvent(new Event('profileUpdated'));
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
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
        
        // Manter compatibilidade com código existente
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userProfile', JSON.stringify({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          profileImage: null
        }));

        window.dispatchEvent(new Event('profileUpdated'));
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const login = async (email: string, password: string, firstName?: string, lastName?: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Se firstName e lastName são fornecidos, é um registro
      if (firstName && lastName) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName
            }
          }
        });

        if (error) {
          console.error('Erro no registro:', error);
          return false;
        }

        if (data.user) {
          // Para desenvolvimento, confirmar automaticamente o email
          return true;
        }
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

        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro na autenticação:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erro no logout:', error);
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
