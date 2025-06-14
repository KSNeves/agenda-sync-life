
import React, { useState } from 'react';
import { ArrowLeft, Bell, Shield, Palette, Timer, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '../context/ThemeContext';

interface SettingsProps {
  onBack: () => void;
}

export default function Settings({ onBack }: SettingsProps) {
  const { isDarkMode, setDarkMode } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [studyReminders, setStudyReminders] = useState(true);
  const [pomodoroTime, setPomodoroTime] = useState('25');
  const [shortBreak, setShortBreak] = useState('5');
  const [longBreak, setLongBreak] = useState('15');
  const [autoStartBreaks, setAutoStartBreaks] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Configurações</h1>
        </div>

        <div className="space-y-6">
          {/* Aparência */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Aparência
              </CardTitle>
              <CardDescription>
                Personalize a aparência do aplicativo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="darkMode">Modo Escuro</Label>
                  <p className="text-sm text-muted-foreground">
                    Ativar tema escuro
                  </p>
                </div>
                <Switch
                  id="darkMode"
                  checked={isDarkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Idioma</Label>
                <Select defaultValue="pt">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt">Português</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notificações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificações
              </CardTitle>
              <CardDescription>
                Configure como você quer receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Notificações Push</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações no navegador
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="studyReminders">Lembretes de Estudo</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba lembretes para suas sessões de estudo
                  </p>
                </div>
                <Switch
                  id="studyReminders"
                  checked={studyReminders}
                  onCheckedChange={setStudyReminders}
                />
              </div>
            </CardContent>
          </Card>

          {/* Configurações do Pomodoro */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                Configurações do Pomodoro
              </CardTitle>
              <CardDescription>
                Configure os tempos do seu timer Pomodoro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pomodoroTime">Tempo de Foco (min)</Label>
                  <Select value={pomodoroTime} onValueChange={setPomodoroTime}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="30">30</SelectItem>
                      <SelectItem value="45">45</SelectItem>
                      <SelectItem value="60">60</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortBreak">Pausa Curta (min)</Label>
                  <Select value={shortBreak} onValueChange={setShortBreak}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="15">15</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longBreak">Pausa Longa (min)</Label>
                  <Select value={longBreak} onValueChange={setLongBreak}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="15">15</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="30">30</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoStartBreaks">Iniciar Pausas Automaticamente</Label>
                  <p className="text-sm text-muted-foreground">
                    Iniciar pausas automaticamente após cada sessão
                  </p>
                </div>
                <Switch
                  id="autoStartBreaks"
                  checked={autoStartBreaks}
                  onCheckedChange={setAutoStartBreaks}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacidade e Segurança */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacidade e Segurança
              </CardTitle>
              <CardDescription>
                Configure suas preferências de privacidade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoBackup">Backup Automático</Label>
                  <p className="text-sm text-muted-foreground">
                    Salvar dados automaticamente na nuvem
                  </p>
                </div>
                <Switch
                  id="autoBackup"
                  checked={autoBackup}
                  onCheckedChange={setAutoBackup}
                />
              </div>
              <div className="space-y-2">
                <Label>Alterar Senha</Label>
                <Button variant="outline" className="w-full">
                  Alterar Senha
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Redefinir Dados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Redefinir Dados
              </CardTitle>
              <CardDescription>
                Redefina ou exporte seus dados do aplicativo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Exportar Dados</Label>
                <Button variant="outline" className="w-full">
                  Baixar Dados em JSON
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Redefinir Configurações</Label>
                <Button variant="outline" className="w-full">
                  Restaurar Padrões
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Apagar Todos os Dados</Label>
                <Button variant="destructive" className="w-full">
                  Apagar Tudo Permanentemente
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Botões de ação */}
          <div className="flex gap-4 pt-6">
            <Button className="flex-1">Salvar Alterações</Button>
            <Button variant="outline" onClick={onBack}>
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
