
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

    const getSession = async () => {
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

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mountedRef.current) return;
      
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        // Clear all storage immediately
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (error) {
          console.error('Error clearing storage:', error);
        }
        // Dispatch events
        window.dispatchEvent(new Event('profileUpdated'));
        window.dispatchEvent(new Event('storage'));
      }
      
      if (mountedRef.current) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
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
      setLoading(true);
      
      // Clear state immediately
      setUser(null);
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Force clear all storage multiple times to ensure cleanup
      try {
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear specific keys if localStorage.clear() doesn't work
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          try {
            localStorage.removeItem(key);
          } catch (e) {
            console.warn('Failed to remove key:', key);
          }
        });
        
        // Clear session storage keys too
        const sessionKeys = Object.keys(sessionStorage);
        sessionKeys.forEach(key => {
          try {
            sessionStorage.removeItem(key);
          } catch (e) {
            console.warn('Failed to remove session key:', key);
          }
        });
      } catch (error) {
        console.error('Error clearing storage:', error);
      }
      
      // Dispatch cleanup events
      window.dispatchEvent(new Event('profileUpdated'));
      window.dispatchEvent(new Event('storage'));
      
      // Force reload after a short delay to ensure clean state
      setTimeout(() => {
        if (mountedRef.current) {
          window.location.href = window.location.origin;
        }
      }, 100);
      
    } catch (error) {
      console.error('Erro no logout:', error);
      // Even if logout fails, clear local state and reload
      setUser(null);
      localStorage.clear();
      sessionStorage.clear();
      setTimeout(() => {
        window.location.href = window.location.origin;
      }, 100);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
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
