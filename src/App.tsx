import { useEffect, useMemo } from 'react';
import { useCardStore } from '@/store/cardStore';
import { CardContainer } from '@/components/Card/CardContainer';
import { MinimizedCard } from '@/components/Card/MinimizedCard';
import { registerCardComponent } from '@/lib/cardRegistry';
import { CalendarCard } from '@/components/cards';
import { useServerSync } from '@/hooks/useServerSync';
import type { Card } from '@/types/card';

// Register custom card components
registerCardComponent('CalendarCard', CalendarCard);

// Demo cards to showcase functionality
function initializeDemoCards() {
  const store = useCardStore.getState();

  // Clear any existing cards
  store.clear();

  // Progress card (persistent - agent controlled)
  store.upsert({
    id: 'build-project',
    type: 'progress',
    title: 'Building Project',
    icon: '🔨',
    priority: 'normal',
    state: 'active',
    persistent: true,
    data: {
      label: 'Compiling TypeScript...',
      progress: 65,
      status: 'active',
    },
  });

  // Calendar card (custom component, persistent)
  store.upsert({
    id: 'calendar-today',
    type: 'custom',
    title: "Today's Schedule",
    icon: '📅',
    priority: 'normal',
    state: 'active',
    persistent: true,
    data: {
      component: 'CalendarCard',
      props: {
        date: new Date().toISOString().split('T')[0],
        events: [
          { id: '1', title: 'Team standup', startTime: '9:00 AM', endTime: '9:30 AM', color: '#007AFF' },
          { id: '2', title: 'Design review', startTime: '2:00 PM', endTime: '3:00 PM', color: '#5856D6' },
          { id: '3', title: '1:1 with Sarah', startTime: '4:30 PM', endTime: '5:00 PM', color: '#34C759' },
        ],
      },
    },
  });

  // List card (ephemeral - user can dismiss)
  store.upsert({
    id: 'tasks',
    type: 'list',
    title: 'Tasks',
    icon: '✅',
    priority: 'normal',
    state: 'active',
    persistent: false,
    data: {
      items: [
        { id: '1', text: 'Review PR #142', done: true },
        { id: '2', text: 'Update documentation', done: false },
        { id: '3', text: 'Fix login bug', done: false },
      ],
    },
  });

  // Status card (high priority, persistent)
  store.upsert({
    id: 'system-status',
    type: 'status',
    title: 'System Status',
    icon: '📊',
    priority: 'high',
    state: 'active',
    persistent: true,
    data: {
      entries: [
        { key: 'API', value: 'Healthy' },
        { key: 'Database', value: 'Connected' },
        { key: 'Cache', value: '94% hit rate' },
      ],
    },
  });

  // Markdown card (ephemeral)
  store.upsert({
    id: 'notes',
    type: 'markdown',
    title: 'Quick Notes',
    icon: '📝',
    priority: 'low',
    state: 'active',
    persistent: false,
    data: {
      content: `### Meeting Notes

- Discussed **Q2 roadmap**
- Need to follow up on *API improvements*
- Schedule demo for next week`,
    },
  });

  // --- Notification cards ---
  store.upsert({
    id: 'notif-pr-merged',
    type: 'notification',
    title: 'PR #142 Merged',
    icon: '🔀',
    priority: 'normal',
    state: 'active',
    persistent: false,
    presentation: 'notification',
    data: {
      body: 'Your pull request "Fix auth token refresh" has been merged into main.',
      appName: 'GitHub',
      timestamp: Date.now() - 5 * 60 * 1000,
    },
  });

  store.upsert({
    id: 'notif-deploy',
    type: 'notification',
    title: 'Deploy Complete',
    icon: '🚀',
    priority: 'normal',
    state: 'active',
    persistent: false,
    presentation: 'notification',
    data: {
      body: 'Production deployment v2.4.1 succeeded. All health checks passing.',
      appName: 'Vercel',
      timestamp: Date.now() - 12 * 60 * 1000,
    },
  });

  store.upsert({
    id: 'notif-comment',
    type: 'notification',
    title: 'New Comment',
    icon: '💬',
    priority: 'low',
    state: 'active',
    persistent: false,
    presentation: 'notification',
    data: {
      body: 'Sarah left a comment on your design review: "Looks great, just one small nit on the spacing."',
      appName: 'Linear',
      timestamp: Date.now() - 45 * 60 * 1000,
    },
  });
}

function App() {
  useServerSync();

  // Subscribe to the cards Map directly for proper reactivity
  const cards = useCardStore((state) => state.cards);

  const priorityOrder: Record<Card['priority'], number> = { high: 0, normal: 1, low: 2 };

  // Live activity cards (default presentation)
  const liveActivities = useMemo(() => {
    return Array.from(cards.values())
      .filter((c) => c.state === 'active' && c.presentation !== 'notification')
      .sort((a, b) => {
        const pd = priorityOrder[a.priority] - priorityOrder[b.priority];
        return pd !== 0 ? pd : b.createdAt - a.createdAt;
      });
  }, [cards]);

  // Notification cards
  const notifications = useMemo(() => {
    return Array.from(cards.values())
      .filter((c) => c.state === 'active' && c.presentation === 'notification')
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [cards]);

  const minimizedCards = useMemo(() => {
    return Array.from(cards.values())
      .filter((c) => c.state === 'minimized')
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [cards]);

  // Load demo cards only when ?demo is in the URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('demo')) {
      initializeDemoCards();
    }
  }, []);

  const hasNoCards = liveActivities.length === 0 && notifications.length === 0;

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col">
      {/* Centered container */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-4 sm:px-8 sm:py-4 flex flex-col">
        {/* Header */}
        <header className="mb-6 flex-shrink-0 text-center pb-4 border-b border-[#e5e5ea]">
          <h1 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">Clawdbot Canvas</h1>
          <p className="text-lg text-[#86868b]">AI-powered notification canvas</p>
        </header>

        {/* Scrollable card stack */}
        <div className="flex-1 overflow-y-auto -mx-2 px-2 pb-4">
          {hasNoCards ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-[#e5e5ea] rounded-2xl flex items-center justify-center mb-4">
                <span className="text-2xl">📭</span>
              </div>
              <p className="text-[#86868b] text-sm">No active notifications</p>
              <p className="text-[#86868b] text-xs mt-1">Cards will appear here when your AI agent sends them</p>
            </div>
          ) : (
            <>
              {/* Live Activities */}
              {liveActivities.length > 0 && (
                <div className="space-y-3">
                  {liveActivities.map((card) => (
                    <CardContainer key={card.id} card={card} />
                  ))}
                </div>
              )}

              {/* Notifications */}
              {notifications.length > 0 && (
                <div className={liveActivities.length > 0 ? 'mt-6' : ''}>
                  <span className="text-xs font-medium text-[#86868b] uppercase tracking-wide mb-2 block">
                    Notifications
                  </span>
                  <div className="space-y-2">
                    {notifications.map((card) => (
                      <CardContainer key={card.id} card={card} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Minimized cards bar */}
        {minimizedCards.length > 0 && (
          <div className="flex-shrink-0 pt-4 border-t border-[#e5e5ea]">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <span className="text-xs text-[#86868b] font-medium flex-shrink-0">Minimized:</span>
              {minimizedCards.map((card) => (
                <MinimizedCard key={card.id} card={card} />
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="pt-4 text-center flex-shrink-0">
          <p className="text-xs text-[#86868b]">
            Clawdbot Canvas • Real-time AI notifications
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
