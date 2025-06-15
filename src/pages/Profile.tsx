
import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Camera, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslation } from '../hooks/useTranslation';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '../context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProfileProps {
  onBack: () => void;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string | null;
}

export default function Profile({ onBack }: ProfileProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Load user profile from Supabase on component mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setFirstName(profile.first_name || '');
          setLastName(profile.last_name || '');
          setEmail(profile.email || '');
          setProfileImage(null); // Implementar storage depois se necessário
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      }
    };

    loadProfile();
  }, [user]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    // Validate required fields
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Erro",
        description: "Por favor, insira um email válido.",
        variant: "destructive",
      });
      return;
    }

    // Validate password change if any password field is filled
    if (currentPassword || newPassword || confirmPassword) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        toast({
          title: "Erro",
          description: "Para alterar a senha, preencha todos os campos de senha.",
          variant: "destructive",
        });
        return;
      }

      if (newPassword !== confirmPassword) {
        toast({
          title: "Erro", 
          description: "A nova senha e confirmação não coincidem.",
          variant: "destructive",
        });
        return;
      }

      if (newPassword.length < 6) {
        toast({
          title: "Erro",
          description: "A nova senha deve ter pelo menos 6 caracteres.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      // Update profile in Supabase
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update password if needed
      if (newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (passwordError) throw passwordError;

        // Clear password fields after successful change
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }

      // Update email if changed
      if (email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email.trim()
        });

        if (emailError) throw emailError;
      }

      // Save profile to localStorage for compatibility
      const userProfile: UserProfile = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        profileImage: profileImage,
      };

      localStorage.setItem('userProfile', JSON.stringify(userProfile));

      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('profileUpdated'));

      toast({
        title: "Sucesso",
        description: "Perfil salvo com sucesso!",
      });
    } catch (error: any) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar perfil.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{t('profile.title')}</h1>
        </div>

        <div className="space-y-6">
          {/* Perfil */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t('profile.personalInfo.title')}
              </CardTitle>
              <CardDescription>
                {t('profile.personalInfo.desc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profileImage || undefined} />
                    <AvatarFallback className="text-lg">
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                    onClick={() => document.getElementById('profile-upload')?.click()}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Clique no ícone da câmera para alterar sua foto de perfil
                  </p>
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t('profile.firstName')}</Label>
                  <Input 
                    id="firstName" 
                    placeholder={`Digite seu ${t('profile.firstName').toLowerCase()}`} 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t('profile.lastName')}</Label>
                  <Input 
                    id="lastName" 
                    placeholder={`Digite seu ${t('profile.lastName').toLowerCase()}`} 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('profile.email')}</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder={`Digite seu ${t('profile.email').toLowerCase()}`} 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password Change Section */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Alterar Senha</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Senha Atual</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Digite sua senha atual"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Digite sua nova senha"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirme sua nova senha"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botões de ação */}
          <div className="flex gap-4 pt-6">
            <Button className="flex-1" onClick={handleSaveProfile}>
              {t('common.save')}
            </Button>
            <Button variant="outline" onClick={onBack}>
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
