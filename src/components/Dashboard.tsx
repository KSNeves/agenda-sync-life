
import React from 'react';
import { Calendar, Clock, BookOpen, BarChart3 } from 'lucide-react';
import { useEvents } from '../context/EventsContext';
import { useRevisions } from '../context/RevisionsContext';
import { useFlashcards } from '../context/FlashcardsContext';
import { useTranslation } from '../hooks/useTranslation';
import { categorizeRevision } from '../utils/spacedRepetition';

export default function Dashboard() {
  const { events } = useEvents();
  const { revisions } = useRevisions();
  const { decks } = useFlashcards();
  const { t } = useTranslation();

  // Categorizar revisões
  const categorizedRevisions = revisions.map(revision => ({
    ...revision,
    category: categorizeRevision(revision)
  }));

  const todayRevisions = categorizedRevisions.filter(r => r.category === 'priority');
  const pendingRevisions = categorizedRevisions.filter(r => r.category === 'pending');

  // Eventos de hoje
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayEvents = events.filter(event => {
    const eventDate = new Date(event.startTime);
    return eventDate >= today && eventDate < tomorrow;
  });

  const totalFlashcards = decks.reduce((total, deck) => total + deck.cards.length, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {t('dashboard.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('dashboard.subtitle')}
        </p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-lg p-6 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('dashboard.todayEvents')}
              </p>
              <p className="text-3xl font-bold text-foreground">
                {todayEvents.length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('dashboard.priorityRevisions')}
              </p>
              <p className="text-3xl font-bold text-foreground">
                {todayRevisions.length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('dashboard.totalFlashcards')}
              </p>
              <p className="text-3xl font-bold text-foreground">
                {totalFlashcards}
              </p>
            </div>
            <BookOpen className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {t('dashboard.pendingRevisions')}
              </p>
              <p className="text-3xl font-bold text-foreground">
                {pendingRevisions.length}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Seções principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Eventos de hoje */}
        <div className="bg-card rounded-lg p-6 border shadow-sm">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary" />
            {t('dashboard.todayEvents')}
          </h2>
          {todayEvents.length > 0 ? (
            <div className="space-y-3">
              {todayEvents.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.startTime).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })} - {new Date(event.endTime).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full bg-${event.customColor || 'blue'}-500`} />
                </div>
              ))}
              {todayEvents.length > 5 && (
                <p className="text-sm text-muted-foreground text-center">
                  +{todayEvents.length - 5} {t('dashboard.moreEvents')}
                </p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              {t('dashboard.noEventsToday')}
            </p>
          )}
        </div>

        {/* Revisões prioritárias */}
        <div className="bg-card rounded-lg p-6 border shadow-sm">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-orange-500" />
            {t('dashboard.priorityRevisions')}
          </h2>
          {todayRevisions.length > 0 ? (
            <div className="space-y-3">
              {todayRevisions.slice(0, 5).map((revision) => (
                <div key={revision.id} className="p-3 bg-background rounded-lg">
                  <p className="font-medium text-foreground">{revision.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('dashboard.revisionCount', { count: revision.revisionCount })}
                  </p>
                </div>
              ))}
              {todayRevisions.length > 5 && (
                <p className="text-sm text-muted-foreground text-center">
                  +{todayRevisions.length - 5} {t('dashboard.moreRevisions')}
                </p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              {t('dashboard.noPriorityRevisions')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
