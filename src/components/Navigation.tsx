import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckSquare,
  List,
  Settings,
  User,
  GraduationCap,
  Menu,
  X
} from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface NavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onSettingsClick: () => void;
  onProfileClick: () => void;
}

interface NavigationItem {
  id: string;
  labelKey: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

import SubscriptionStatus from './SubscriptionStatus';

export default function Navigation({ activeView, onViewChange, onSettingsClick, onProfileClick }: NavigationProps) {
  const { t } = useTranslation();
  const { logout, user: authUser } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    profileImage: null,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('userProfile');
    if (storedUser) {
      setUserProfile(JSON.parse(storedUser));
    }

    const handleProfileUpdate = () => {
      const updatedUser = localStorage.getItem('userProfile');
      if (updatedUser) {
        setUserProfile(JSON.parse(updatedUser));
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const navigationItems: NavigationItem[] = [
    { id: 'calendar', labelKey: 'navigation.calendar', icon: Calendar },
    { id: 'tasks', labelKey: 'navigation.tasks', icon: CheckSquare },
    { id: 'revisions', labelKey: 'navigation.revisions', icon: List },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <GraduationCap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">StudyPro</span>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`${
                    activeView === item.id
                      ? 'border-blue-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm inline-flex items-center`}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {t(item.labelKey)}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <SubscriptionStatus />
            
            {/* Profile dropdown */}
            <div className="ml-3 relative">
              <div>
                <button
                  type="button"
                  className="bg-white dark:bg-gray-800 rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                >
                  <span className="sr-only">Open user menu</span>
                  <User className="h-8 w-8 text-gray-400" />
                </button>
              </div>
              {isProfileMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <button
                    onClick={onProfileClick}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left"
                  >
                    {t('navigation.profile')}
                  </button>
                  <button
                    onClick={onSettingsClick}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left"
                  >
                    {t('navigation.settings')}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 w-full text-left"
                  >
                    {t('navigation.logout')}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu */}
          <div className="sm:hidden flex items-center space-x-2">
            <SubscriptionStatus />
            <button
              type="button"
              className="bg-white dark:bg-gray-800 rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`${
                  activeView === item.id
                    ? 'bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-700 dark:text-blue-300'
                    : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 hover:text-gray-800 dark:hover:text-gray-200'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left flex items-center`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {t(item.labelKey)}
              </button>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <User className="h-10 w-10 text-gray-400" />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                  {userProfile?.firstName} {userProfile?.lastName}
                </div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {userProfile?.email}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button
                onClick={() => {
                  onProfileClick();
                  setIsMobileMenuOpen(false);
                }}
                className="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
              >
                {t('navigation.profile')}
              </button>
              <button
                onClick={() => {
                  onSettingsClick();
                  setIsMobileMenuOpen(false);
                }}
                className="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
              >
                {t('navigation.settings')}
              </button>
              <button
                onClick={handleLogout}
                className="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
              >
                {t('navigation.logout')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
