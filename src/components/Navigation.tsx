
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

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string | null;
}

export default function Navigation({ currentView, onViewChange }: NavigationProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const { logout } = useAuth();

  // Load user profile from localStorage and listen for changes
  useEffect(() => {
    const loadProfile = () => {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      }
    };

    // Load initially
    loadProfile();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userProfile') {
        loadProfile();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom event when profile is updated in the same tab
    const handleProfileUpdate = () => {
      loadProfile();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

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

  const handleProfileAction = (action: string) => {
    console.log(`Profile action: ${action}`);
    switch (action) {
      case 'profile':
        onViewChange('profile');
        break;
      case 'settings':
        onViewChange('settings');
        break;
      case 'logout':
        logout();
        break;
    }
  };

  const handleLanguageChange = (languageCode: 'pt' | 'en' | 'es') => {
    setLanguage(languageCode);
  };

  return (
    <nav className="bg-card border-b">
      <div className="max-w-6xl mx-auto px-2 md:px-4">
        <div className="flex items-center justify-between">
          {/* Navegação centralizada */}
          <div className="flex-1 flex justify-center">
            <div className="flex space-x-2 md:space-x-8">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 py-3 md:py-4 px-1 md:px-2 border-b-2 transition-colors ${
                      currentView === item.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon size={16} className="md:hidden" />
                    <Icon size={18} className="hidden md:block" />
                    <span className="font-medium text-xs md:text-sm">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botão de perfil */}
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 md:gap-2 p-1 md:p-2 rounded-full hover:bg-accent transition-colors">
                  <Avatar className="w-6 h-6 md:w-8 md:h-8">
                    <AvatarImage src={userProfile?.profileImage || undefined} />
                    <AvatarFallback className="bg-primary">
                      <User size={12} className="md:hidden text-primary-foreground" />
                      <User size={16} className="hidden md:block text-primary-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown size={12} className="md:hidden text-muted-foreground" />
                  <ChevronDown size={16} className="hidden md:block text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 md:w-48 bg-card/95 backdrop-blur-sm border border-border/50">
                <DropdownMenuItem onClick={() => handleProfileAction('profile')} className="text-xs md:text-sm">
                  <User size={14} className="md:hidden mr-2" />
                  <User size={16} className="hidden md:block mr-2" />
                  {t('navigation.profile')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleProfileAction('settings')} className="text-xs md:text-sm">
                  <Settings size={14} className="md:hidden mr-2" />
                  <Settings size={16} className="hidden md:block mr-2" />
                  {t('navigation.settings')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="text-xs md:text-sm">
                    <Globe size={14} className="md:hidden mr-2" />
                    <Globe size={16} className="hidden md:block mr-2" />
                    {t('navigation.language')}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-card/95 backdrop-blur-sm border border-border/50">
                    {languages.map((lang) => (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`text-xs md:text-sm ${language === lang.code ? 'bg-accent' : ''}`}
                      >
                        <span className="mr-2">{lang.flag}</span>
                        {lang.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleProfileAction('logout')} className="text-xs md:text-sm">
                  <LogOut size={14} className="md:hidden mr-2" />
                  <LogOut size={16} className="hidden md:block mr-2" />
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
