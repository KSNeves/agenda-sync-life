
import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, BookOpen, Brain, User, ChevronDown, Settings, LogOut, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_image: string | null;
}

export default function Navigation({ currentView, onViewChange }: NavigationProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const { user, signOut } = useAuth();

  // Load user profile from Supabase
  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      if (data) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Exception loading profile:', error);
    }
  };

  const navItems = [
    { id: 'dashboard', label: t('navigation.dashboard'), icon: BarChart3 },
    { id: 'schedule', label: t('navigation.schedule'), icon: Clock },
    { id: 'revision', label: t('navigation.revision'), icon: BookOpen },
    { id: 'flashcards', label: 'Flashcards', icon: Brain },
  ];

  const languages = [
    { code: 'pt' as const, name: 'Português', flag: '🇧🇷' },
    { code: 'en' as const, name: 'English', flag: '🇺🇸' },
    { code: 'es' as const, name: 'Español', flag: '🇪🇸' },
  ];

  const handleProfileAction = async (action: string) => {
    console.log(`Profile action: ${action}`);
    switch (action) {
      case 'profile':
        onViewChange('profile');
        break;
      case 'settings':
        onViewChange('settings');
        break;
      case 'logout':
        await signOut();
        break;
    }
  };

  const handleLanguageChange = (languageCode: 'pt' | 'en' | 'es') => {
    setLanguage(languageCode);
  };

  const getDisplayName = () => {
    if (userProfile) {
      return `${userProfile.first_name} ${userProfile.last_name}`;
    }
    return user?.email || 'Usuário';
  };

  const getInitials = () => {
    if (userProfile && userProfile.first_name && userProfile.last_name) {
      return `${userProfile.first_name[0]}${userProfile.last_name[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <nav className="bg-card border-b">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Navegação centralizada */}
          <div className="flex-1 flex justify-center">
            <div className="flex space-x-8">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-colors ${
                      currentView === item.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botão de perfil */}
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-2 rounded-full hover:bg-accent transition-colors">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={userProfile?.profile_image || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium">{getDisplayName()}</span>
                  <ChevronDown size={16} className="text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                <DropdownMenuItem onClick={() => handleProfileAction('profile')}>
                  <User size={16} className="mr-2" />
                  {t('navigation.profile')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleProfileAction('settings')}>
                  <Settings size={16} className="mr-2" />
                  {t('navigation.settings')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Globe size={16} className="mr-2" />
                    {t('navigation.language')}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-card border-border">
                    {languages.map((lang) => (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={language === lang.code ? 'bg-accent' : ''}
                      >
                        <span className="mr-2">{lang.flag}</span>
                        {lang.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleProfileAction('logout')}>
                  <LogOut size={16} className="mr-2" />
                  {t('navigation.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
