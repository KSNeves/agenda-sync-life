
import React from 'react';
import { BarChart3, Clock, BookOpen, Brain } from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export default function Navigation({ currentView, onViewChange }: NavigationProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'schedule', label: 'Schedule', icon: Clock },
    { id: 'revision', label: 'Revision', icon: BookOpen },
    { id: 'flashcards', label: 'Flashcards', icon: Brain },
  ];

  return (
    <nav className="bg-card border-b">
      <div className="max-w-6xl mx-auto px-4">
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
    </nav>
  );
}
