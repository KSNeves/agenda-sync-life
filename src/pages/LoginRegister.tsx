
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Globe, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoginLanguageProvider, useLoginLanguage } from '../context/LoginLanguageContext';
import { useAuth } from '../context/AuthContext';

function LoginRegisterContent() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const { language, setLanguage, t } = useLoginLanguage();
  const { signIn, signUp, loading, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const languages = [
    { code: 'pt' as const, name: 'Português', flag: '🇧🇷' },
    { code: 'en' as const, name: 'English', flag: '🇺🇸' },
    { code: 'es' as const, name: 'Español', flag: '🇪🇸' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    if (isLogin) {
      await signIn(email, password);
    } else {
      if (!firstName || !lastName) {
        return;
      }
      await signUp(email, password, firstName, lastName);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-gray-900 flex items-center justify-center p-4">
      {/* Language Selector */}
      <div className="absolute top-4 right-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="bg-card/80 backdrop-blur-sm border-border/50">
              <Globe size={16} className="mr-2" />
              {t('auth.language')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={language === lang.code ? 'bg-accent' : ''}
              >
                <span className="mr-2">{lang.flag}</span>
                {lang.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Card */}
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/50 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            {isLogin ? t('auth.welcomeBack') : t('auth.createAccount')}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isLogin ? t('auth.welcomeBackDesc') : t('auth.createAccountDesc')}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t('auth.firstName')}</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={t('auth.firstNamePlaceholder')}
                    required={!isLogin}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t('auth.lastName')}</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={t('auth.lastNamePlaceholder')}
                    required={!isLogin}
                    disabled={loading}
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder')}
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                required
                disabled={loading}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gray-700 hover:bg-gray-800 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLogin ? 'Entrando...' : 'Criando conta...'}
                </>
              ) : (
                isLogin ? t('auth.login') : t('auth.register')
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? t('auth.dontHaveAccount') : t('auth.alreadyHaveAccount')}{' '}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium hover:underline"
                disabled={loading}
              >
                {t('auth.clickHere')}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginRegister() {
  return (
    <LoginLanguageProvider>
      <LoginRegisterContent />
    </LoginLanguageProvider>
  );
}
