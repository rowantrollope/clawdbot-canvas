import { useEffect, useMemo, useRef, useCallback, useState } from 'react';
import { useCardStore } from '@/store/cardStore';
import { CardContainer } from '@/components/Card/CardContainer';
import { MinimizedStack } from '@/components/Card/MinimizedStack';
import { registerCardComponent } from '@/lib/cardRegistry';
import { CalendarCard, CPUChart, WorldClock } from '@/components/cards';
import { useServerSync } from '@/hooks/useServerSync';
import { SecurityBadge } from '@/components/SecurityBadge';
import type { Card } from '@/types/card';

// Register custom card components
registerCardComponent('CalendarCard', CalendarCard);
registerCardComponent('CPUChart', CPUChart);
registerCardComponent('WorldClock', WorldClock);

// Types for API responses
interface CalendarEvent {
  id: string;
  summary: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
}

interface Task {
  id: string;
  text: string;
  done: boolean;
  section: string;
}

interface CronJob {
  id: string;
  name: string;
  enabled: boolean;
  schedule: string;
  timezone: string;
  nextRun: string | null;
  lastStatus: string | null;
}

// Fetch live data and create cards
// Auth is handled via cookies (set when page loads with ?token=xxx)
async function fetchAndCreateCards() {
  const store = useCardStore.getState();
  
  try {
    // Fetch all data in parallel (cookies sent automatically)
    const [calendarRes, tasksRes, cronsRes] = await Promise.all([
      fetch('/api/calendar', { credentials: 'same-origin' }).then(r => r.json()).catch(() => ({ events: [] })),
      fetch('/api/tasks', { credentials: 'same-origin' }).then(r => r.json()).catch(() => ({ tasks: [] })),
      fetch('/api/crons', { credentials: 'same-origin' }).then(r => r.json()).catch(() => ({ crons: [] })),
    ]);

    const events: CalendarEvent[] = calendarRes.events || [];
    const tasks: Task[] = tasksRes.tasks || [];
    const crons: CronJob[] = cronsRes.crons || [];

    // World clock card - using custom component with large visual clocks
    store.upsert({
      id: 'world-clock',
      type: 'custom',
      title: 'World Clock',
      icon: '🕐',
      priority: 'high',
      state: store.cards.get('world-clock')?.state || 'active',
      persistent: true,
      data: {
        component: 'WorldClock',
        props: {
          cities: [
            { name: 'Tel Aviv', timezone: 'Asia/Jerusalem', emoji: '🇮🇱' },
            { name: 'San Francisco', timezone: 'America/Los_Angeles', emoji: '🇺🇸' },
          ],
        },
      },
    });

    // Iran situation alert card
    store.upsert({
      id: 'iran-alert',
      type: 'markdown',
      title: '🚨 Iran Situation',
      icon: '⚠️',
      priority: 'high',
      state: store.cards.get('iran-alert')?.state || 'active',
      persistent: true,
      data: {
        content: `**USS Abraham Lincoln** carrier group in Middle East waters

• Explosion reported at **Parchin** nuclear site
• Iran warns of "instability" from US threats
• Death toll from protests: **6,000+** confirmed

*You're in Tel Aviv — stay aware*`,
      },
    });

    // Calendar card with real events
    const timedEvents = events.filter(e => !e.isAllDay && e.startTime);
    const calendarEvents = timedEvents.slice(0, 10).map((e, idx) => ({
      id: e.id || String(idx),
      title: e.summary,
      startTime: e.startTime,
      endTime: e.endTime,
      color: ['#007AFF', '#5856D6', '#34C759', '#FF9500', '#FF3B30', '#AF52DE', '#00C7BE', '#FF2D55', '#5AC8FA', '#FFCC00'][idx % 10],
    }));

    store.upsert({
      id: 'calendar-today',
      type: 'custom',
      title: `Today's Schedule (${timedEvents.length} meetings)`,
      icon: '📅',
      priority: 'high',
      state: store.cards.get('calendar-today')?.state || 'active',
      persistent: true,
      data: {
        component: 'CalendarCard',
        props: {
          date: new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' }),
          events: calendarEvents,
        },
      },
    });

    // Tasks card
    const openTasks = tasks.filter(t => !t.done);
    const doneTasks = tasks.filter(t => t.done);
    store.upsert({
      id: 'tasks',
      type: 'list',
      title: `Tasks (${openTasks.length} open, ${doneTasks.length} done)`,
      icon: '✅',
      priority: 'normal',
      state: store.cards.get('tasks')?.state || 'active',
      persistent: true,
      data: {
        items: tasks.slice(0, 12).map(t => ({
          id: t.id,
          text: `[${t.section}] ${t.text}`,
          done: t.done,
        })),
      },
    });

    // Automations status card
    const enabledCrons = crons.filter(c => c.enabled);
    store.upsert({
      id: 'automations',
      type: 'status',
      title: `Active Automations (${enabledCrons.length})`,
      icon: '⚡',
      priority: 'normal',
      state: store.cards.get('automations')?.state || 'active',
      persistent: true,
      data: {
        entries: enabledCrons.map(c => ({
          key: c.name,
          value: c.lastStatus === 'ok' ? '✓ Running' : c.nextRun ? 'Scheduled' : 'Pending',
        })),
      },
    });

    // Travel info card
    store.upsert({
      id: 'travel-info',
      type: 'status',
      title: 'Travel Status',
      icon: '✈️',
      priority: 'low',
      state: store.cards.get('travel-info')?.state || 'active',
      persistent: true,
      data: {
        entries: [
          { key: 'Location', value: '📍 Tel Aviv' },
          { key: 'Hotel', value: 'InterContinental David' },
          { key: 'Departure', value: 'Tonight 12:45am → LAX' },
          { key: 'Flight', value: 'LY5 El-Al' },
        ],
      },
    });

    console.log('Live cards updated:', { events: events.length, tasks: tasks.length, crons: crons.length });
  } catch (e) {
    console.error('Failed to fetch live data:', e);
  }
}

function App() {
  useServerSync();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  
  const cards = useCardStore((state) => state.cards);

  const priorityOrder: Record<Card['priority'], number> = { high: 0, normal: 1, low: 2 };

  const activeCards = useMemo(() => {
    return Array.from(cards.values())
      .filter((c) => c.state === 'active')
      .sort((a, b) => {
        const pd = priorityOrder[a.priority] - priorityOrder[b.priority];
        return pd !== 0 ? pd : b.createdAt - a.createdAt;
      });
  }, [cards]);

  const minimizedCards = useMemo(() => {
    return Array.from(cards.values())
      .filter((c) => c.state === 'minimized')
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [cards]);

  const handleRefresh = useCallback(() => {
    fetchAndCreateCards();
    setLastUpdate(new Date().toLocaleTimeString('en-US', { 
      timeZone: 'Asia/Jerusalem',
      hour: '2-digit',
      minute: '2-digit',
    }));
  }, []);

  // Load live data on mount and every 60 seconds
  useEffect(() => {
    handleRefresh();
    const interval = setInterval(handleRefresh, 60000);
    return () => clearInterval(interval);
  }, [handleRefresh]);

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col">
      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-4 sm:px-8 sm:py-4 flex flex-col">
        {/* Header */}
        <header className="mb-4 flex-shrink-0 pb-3 border-b border-[#e5e5ea]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[28px] font-bold text-[#1d1d1f] tracking-tight leading-tight">
                Clawdbot Canvas
              </h1>
              <p className="text-xs text-[#86868b] mt-1 flex items-center gap-1.5">
                <SecurityBadge />
                Live data • {lastUpdate ? `Updated ${lastUpdate} Israel` : 'Loading...'}
              </p>
            </div>
            <button 
              onClick={handleRefresh}
              className="px-3 py-1.5 text-sm bg-[#007AFF] text-white rounded-lg hover:bg-[#0066CC] transition-colors"
            >
              🔄 Refresh
            </button>
          </div>
        </header>

        {/* Scrollable card stack */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto -mx-2 px-2 pb-4">
          {activeCards.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-[#e5e5ea] rounded-2xl flex items-center justify-center mb-4">
                <span className="text-2xl">⏳</span>
              </div>
              <p className="text-[#86868b] text-sm">Loading live data...</p>
              <p className="text-[#86868b] text-xs mt-1">Calendar, tasks, and automations</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeCards.map((card) => (
                <CardContainer key={card.id} card={card} />
              ))}
            </div>
          )}

          {/* Minimized cards */}
          {minimizedCards.length > 0 && (
            <MinimizedStack cards={minimizedCards} scrollRef={scrollRef} />
          )}
        </div>

        {/* Footer */}
        <footer className="pt-4 text-center flex-shrink-0">
          <p className="text-xs text-[#86868b]">
            Auto-refreshes every 60s • Tap cards to minimize
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
