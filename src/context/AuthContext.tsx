
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
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
  const mountedRef = useRef(true);
  const initRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initAuth = async () => {
      if (!mountedRef.current) return;
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mountedRef.current) {
          await loadUserProfile(session.user);
        }
      } catch (error) {
        console.error('Erro ao carregar sessão:', error);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mountedRef.current) return;
      
      console.log('Auth state change:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        // Clear storage mais agressivamente
        try {
          const keys = Object.keys(localStorage);
          keys.forEach(key => {
            if (key.startsWith('sb-') || key.includes('supabase') || key === 'user' || key === 'userProfile') {
              localStorage.removeItem(key);
            }
          });
          sessionStorage.clear();
        } catch (error) {
          console.error('Error clearing storage:', error);
        }
        window.dispatchEvent(new Event('profileUpdated'));
      }
      
      if (mountedRef.current) {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    if (!mountedRef.current) return;
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (profile && mountedRef.current) {
        const userData: User = {
          id: profile.id,
          firstName: profile.first_name || 'Usuário',
          lastName: profile.last_name || 'Teste',
          email: profile.email || supabaseUser.email || ''
        };

        setUser(userData);
        
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
      
      if (!email || !password) {
        throw new Error('Email e senha são obrigatórios');
      }
      
      if (firstName && lastName) {
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

        return !!data.user;
      } else {
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
    } catch (error) {
      console.error('Erro na autenticação:', error);
      return false;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const logout = async () => {
    try {
      console.log('Iniciando logout...');
      setLoading(true);
      
      // Clear state immediately
      setUser(null);
      
      // Clear storage first
      try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase') || key === 'user' || key === 'userProfile') {
            localStorage.removeItem(key);
          }
        });
        sessionStorage.clear();
      } catch (error) {
        console.error('Error clearing storage:', error);
      }
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro no logout:', error);
      }
      
      // Dispatch events
      window.dispatchEvent(new Event('profileUpdated'));
      window.dispatchEvent(new Event('storage'));
      
      console.log('Logout concluído, redirecionando...');
      
      // Force navigation to home and reload
      window.location.href = window.location.origin;
      
    } catch (error) {
      console.error('Erro no logout:', error);
      // Force reload even if logout fails
      window.location.href = window.location.origin;
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
