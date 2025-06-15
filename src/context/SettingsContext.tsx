
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface UserSettings {
  id: string;
  theme: 'light' | 'dark';
  language: 'pt' | 'en' | 'es';
  focusTime: number;
  shortBreak: number;
  longBreak: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
}

interface SettingsContextType {
  settings: UserSettings | null;
  isLoaded: boolean;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadSettings();
    } else {
      setSettings(null);
      setIsLoaded(true);
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      console.log('🔄 Loading settings from Supabase for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading settings:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar configurações.",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        const userSettings: UserSettings = {
          id: data.id,
          theme: data.theme as 'light' | 'dark' || 'dark',
          language: data.language as 'pt' | 'en' | 'es' || 'pt',
          focusTime: data.focus_time || 25,
          shortBreak: data.short_break || 5,
          longBreak: data.long_break || 15,
          longBreakInterval: data.long_break_interval || 4,
          autoStartBreaks: data.auto_start_breaks || false,
        };

        console.log('⚙️ Loaded settings from Supabase:', userSettings);
        setSettings(userSettings);
      } else {
        // Create default settings if none exist
        await createDefaultSettings();
      }
    } catch (error) {
      console.error('Exception loading settings:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar configurações.",
        variant: "destructive",
      });
    } finally {
      setIsLoaded(true);
    }
  };

  const createDefaultSettings = async () => {
    if (!user) return;

    try {
      const defaultSettings = {
        id: user.id,
        theme: 'dark' as const,
        language: 'pt' as const,
        focus_time: 25,
        short_break: 5,
        long_break: 15,
        long_break_interval: 4,
        auto_start_breaks: false,
      };

      const { data, error } = await supabase
        .from('user_settings')
        .insert(defaultSettings)
        .select()
        .single();

      if (error) {
        console.error('Error creating default settings:', error);
        return;
      }

      const userSettings: UserSettings = {
        id: data.id,
        theme: data.theme as 'light' | 'dark',
        language: data.language as 'pt' | 'en' | 'es',
        focusTime: data.focus_time,
        shortBreak: data.short_break,
        longBreak: data.long_break,
        longBreakInterval: data.long_break_interval,
        autoStartBreaks: data.auto_start_breaks,
      };

      setSettings(userSettings);
    } catch (error) {
      console.error('Exception creating default settings:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user || !settings) return;

    try {
      const updatedSettings = { ...settings, ...newSettings };
      
      const { error } = await supabase
        .from('user_settings')
        .update({
          theme: updatedSettings.theme,
          language: updatedSettings.language,
          focus_time: updatedSettings.focusTime,
          short_break: updatedSettings.shortBreak,
          long_break: updatedSettings.longBreak,
          long_break_interval: updatedSettings.longBreakInterval,
          auto_start_breaks: updatedSettings.autoStartBreaks,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating settings:', error);
        toast({
          title: "Erro",
          description: "Erro ao salvar configurações.",
          variant: "destructive",
        });
        return;
      }

      setSettings(updatedSettings);
      
      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!",
      });
    } catch (error) {
      console.error('Exception updating settings:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar configurações.",
        variant: "destructive",
      });
    }
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      isLoaded,
      updateSettings,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
