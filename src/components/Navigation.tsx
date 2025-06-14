
import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, BookOpen, Brain, User, ChevronDown, Settings, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'schedule', label: 'Schedule', icon: Clock },
    { id: 'revision', label: 'Revision', icon: BookOpen },
    { id: 'flashcards', label: 'Flashcards', icon: Brain },
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
        // Implementar logout
        break;
    }
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
                    <AvatarImage src={userProfile?.profileImage || undefined} />
                    <AvatarFallback className="bg-primary">
                      <User size={16} className="text-primary-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown size={16} className="text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleProfileAction('profile')}>
                  <User size={16} className="mr-2" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleProfileAction('settings')}>
                  <Settings size={16} className="mr-2" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleProfileAction('logout')}>
                  <LogOut size={16} className="mr-2" />
                  Sair da conta
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
