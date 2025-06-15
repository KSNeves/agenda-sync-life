
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (event === 'SIGNED_IN') {
          toast.success('Login realizado com sucesso!');
        } else if (event === 'SIGNED_OUT') {
          toast.success('Logout realizado com sucesso!');
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    setLoading(true);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    });

    if (error) {
      console.error('Signup error:', error);
      toast.error(error.message);
      setLoading(false);
      return { error };
    }

    toast.success('Conta criada com sucesso! Verifique seu email para confirmar.');
    setLoading(false);
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Signin error:', error);
      
      // Handle email not confirmed error specifically
      if (error.message === 'Email not confirmed') {
        toast.error('Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada.');
      } else {
        toast.error(error.message);
      }
      
      setLoading(false);
      return { error };
    }

    setLoading(false);
    return { error: null };
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Signout error:', error);
      toast.error(error.message);
    }
    
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      isAuthenticated: !!user && !!session
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
