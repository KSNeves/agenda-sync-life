
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface UserSettings {
  theme: 'light' | 'dark';
  language: 'pt' | 'en' | 'es';
  focusTime: number;
  shortBreak: number;
  longBreak: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
}

interface SettingsContextType {
  settings: UserSettings;
  isLoaded: boolean;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
}

const defaultSettings: UserSettings = {
  theme: 'dark',
  language: 'pt',
  focusTime: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
};

const SupabaseSettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SupabaseSettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from Supabase
  const loadSettings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        const transformedSettings: UserSettings = {
          theme: (data.theme as 'light' | 'dark') || defaultSettings.theme,
          language: (data.language as 'pt' | 'en' | 'es') || defaultSettings.language,
          focusTime: data.focus_time || defaultSettings.focusTime,
          shortBreak: data.short_break || defaultSettings.shortBreak,
          longBreak: data.long_break || defaultSettings.longBreak,
          longBreakInterval: data.long_break_interval || defaultSettings.longBreakInterval,
          autoStartBreaks: data.auto_start_breaks || defaultSettings.autoStartBreaks,
        };

        setSettings(transformedSettings);
      } else {
        // Create default settings if none exist
        await supabase
          .from('user_settings')
          .insert({
            id: user.id,
            theme: defaultSettings.theme,
            language: defaultSettings.language,
            focus_time: defaultSettings.focusTime,
            short_break: defaultSettings.shortBreak,
            long_break: defaultSettings.longBreak,
            long_break_interval: defaultSettings.longBreakInterval,
            auto_start_breaks: defaultSettings.autoStartBreaks,
          });
        
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setSettings(defaultSettings);
    }
  };

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadSettings();
    } else {
      setSettings(defaultSettings);
    }
    setIsLoaded(true);
  }, [user]);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    if (user) {
      supabase
        .from('user_settings')
        .update({
          theme: updatedSettings.theme,
          language: updatedSettings.language,
          focus_time: updatedSettings.focusTime,
          short_break: updatedSettings.shortBreak,
          long_break: updatedSettings.longBreak,
          long_break_interval: updatedSettings.longBreakInterval,
          auto_start_breaks: updatedSettings.autoStartBreaks,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
    }
  };

  return (
    <SupabaseSettingsContext.Provider value={{
      settings,
      isLoaded,
      updateSettings,
    }}>
      {children}
    </SupabaseSettingsContext.Provider>
  );
}

export function useSupabaseSettings() {
  const context = useContext(SupabaseSettingsContext);
  if (context === undefined) {
    throw new Error('useSupabaseSettings must be used within a SupabaseSettingsProvider');
  }
  return context;
}
