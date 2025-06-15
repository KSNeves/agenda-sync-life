
import React, { useState } from 'react';
import { ArrowLeft, Bell, Palette, Timer, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import { usePomodoro } from '../context/PomodoroContext';
import { useApp } from '../context/AppContext';
import { useFlashcards } from '../hooks/useFlashcards';
import { toast } from '@/components/ui/use-toast';
import { useSupabaseCalendarEvents, useSupabaseRevisions } from '../hooks/useSupabaseData';

interface SettingsProps {
  onBack: () => void;
}

export default function Settings({ onBack }: SettingsProps) {
  const { isDarkMode, setDarkMode } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const { settings, updateSettings } = usePomodoro();
  const { dispatch } = useApp();
  const { deleteAllDecks } = useFlashcards();
  const calendarData = useSupabaseCalendarEvents();
  const revisionsData = useSupabaseRevisions();
  
  const [notifications, setNotifications] = useState(true);
  const [studyReminders, setStudyReminders] = useState(true);

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'pt', label: 'Português' },
  ];

  // Generate time options in 5-minute intervals
  const generateTimeOptions = (min: number, max: number) => {
    const options = [];
    for (let i = min; i <= max; i += 5) {
      options.push({ value: i.toString(), label: `${i}` });
    }
    return options;
  };

  const focusTimeOptions = generateTimeOptions(5, 120); // 5 to 120 minutes
  const shortBreakOptions = generateTimeOptions(5, 30); // 5 to 30 minutes
  const longBreakOptions = generateTimeOptions(5, 60); // 5 to 60 minutes

  const handleDeleteSchedule = async () => {
    try {
      await calendarData.clearEvents();
      toast({
        title: t('settings.scheduleDeleted'),
        description: t('settings.deleteSchedule.desc'),
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao deletar agenda.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAllData = async () => {
    try {
      // Clear schedule events
      await calendarData.clearEvents();
      
      // Clear flashcards
      await deleteAllDecks();
      
      // Clear revision items
      await revisionsData.clearRevisions();
      
      // Reset pomodoro settings to default
      updateSettings({
        focusTime: 25,
        shortBreak: 5,
        longBreak: 15,
        longBreakInterval: 4,
        autoStartBreaks: false
      });
      
      toast({
        title: t('settings.allDataDeleted'),
        description: t('settings.deleteAllData.desc'),
        variant: "destructive"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao deletar todos os dados.",
        variant: "destructive",
      });
    }
  };

  const handleSaveChanges = () => {
    // Save notification settings to localStorage
    localStorage.setItem('notifications', JSON.stringify(notifications));
    localStorage.setItem('studyReminders', JSON.stringify(studyReminders));
    
    toast({
      title: t('settings.changesSaved.title'),
      description: t('settings.changesSaved.desc'),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
        </div>

        <div className="space-y-6">
          {/* Aparência */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                {t('settings.appearance.title')}
              </CardTitle>
              <CardDescription>
                {t('settings.appearance.desc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="darkMode">{t('settings.darkMode.title')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.darkMode.desc')}
                  </p>
                </div>
                <Switch
                  id="darkMode"
                  checked={isDarkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">{t('settings.language.title')}</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('settings.language.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
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
                {t('settings.notifications.title')}
              </CardTitle>
              <CardDescription>
                {t('settings.notifications.desc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">{t('settings.pushNotifications.title')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.pushNotifications.desc')}
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
                  <Label htmlFor="studyReminders">{t('settings.studyReminders.title')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.studyReminders.desc')}
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
                {t('settings.pomodoro.title')}
              </CardTitle>
              <CardDescription>
                {t('settings.pomodoro.desc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="focusTime">{t('settings.pomodoro.focusTime')}</Label>
                  <Select 
                    value={settings.focusTime.toString()} 
                    onValueChange={(value) => updateSettings({ focusTime: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {focusTimeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortBreak">{t('settings.pomodoro.shortBreak')}</Label>
                  <Select 
                    value={settings.shortBreak.toString()} 
                    onValueChange={(value) => updateSettings({ shortBreak: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {shortBreakOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longBreak">{t('settings.pomodoro.longBreak')}</Label>
                  <Select 
                    value={settings.longBreak.toString()} 
                    onValueChange={(value) => updateSettings({ longBreak: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {longBreakOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longBreakInterval">{t('settings.pomodoro.longBreakInterval')}</Label>
                  <Select 
                    value={settings.longBreakInterval.toString()} 
                    onValueChange={(value) => updateSettings({ longBreakInterval: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="6">6</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoStartBreaks">{t('settings.autoStartBreaks.title')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.autoStartBreaks.desc')}
                  </p>
                </div>
                <Switch
                  id="autoStartBreaks"
                  checked={settings.autoStartBreaks}
                  onCheckedChange={(checked) => updateSettings({ autoStartBreaks: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Redefinir Dados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                {t('settings.resetData.title')}
              </CardTitle>
              <CardDescription>
                {t('settings.resetData.desc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('settings.deleteSchedule.title')}</Label>
                <Button 
                  variant="outline" 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={handleDeleteSchedule}
                >
                  {t('settings.deleteSchedule.btn')}
                </Button>
              </div>
              <div className="space-y-2">
                <Label>{t('settings.deleteAllData.title')}</Label>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleDeleteAllData}
                >
                  {t('settings.deleteAllData.btn')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 pt-6">
            <Button className="flex-1" onClick={handleSaveChanges}>
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
