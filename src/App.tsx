import { useMemo, useRef, useCallback } from 'react';
import { useCardStore } from '@/store/cardStore';
import { CardContainer } from '@/components/Card/CardContainer';
import { MinimizedStack } from '@/components/Card/MinimizedStack';
import { registerCardComponent } from '@/lib/cardRegistry';
import { CalendarCard, CPUChart, WorldClock } from '@/components/cards';
import { useServerSync } from '@/hooks/useServerSync';
import { ArchiveDrawer } from '@/components/Archive/ArchiveDrawer';
import type { Card } from '@/types/card';

// Register custom card components
registerCardComponent('CalendarCard', CalendarCard);
registerCardComponent('CPUChart', CPUChart);
registerCardComponent('WorldClock', WorldClock);

function App() {
  useServerSync();
  const scrollRef = useRef<HTMLDivElement>(null);
  
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

  const archivedCards = useMemo(() => {
    return Array.from(cards.values())
      .filter((c) => c.state === 'archived')
      .sort((a, b) => (b.archivedAt ?? 0) - (a.archivedAt ?? 0));
  }, [cards]);

  const handleRestore = useCallback((id: string) => {
    const token = window.__CLAWDBOT_CANVAS_TOKEN;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    fetch(`/api/cards/${encodeURIComponent(id)}/restore`, { method: 'POST', headers })
      .catch(() => {});
  }, []);

  const handleClearArchive = useCallback(() => {
    const token = window.__CLAWDBOT_CANVAS_TOKEN;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    fetch('/api/archive', { method: 'DELETE', headers })
      .catch(() => {});
  }, []);

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
            </div>
          </div>
        </header>

        {/* Scrollable card stack */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto -mx-2 px-2 pb-4">
          {activeCards.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-[#e5e5ea] rounded-2xl flex items-center justify-center mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <p className="text-[#86868b] text-sm">No active cards</p>
              <p className="text-[#86868b] text-xs mt-1">Waiting for agent to push cards via API</p>
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

          {/* Archive drawer */}
          <ArchiveDrawer cards={archivedCards} onRestore={handleRestore} onClearArchive={handleClearArchive} />
        </div>

        {/* Footer */}
        <footer className="pt-4 text-center flex-shrink-0">
          <p className="text-xs text-[#86868b]">
            Tap cards to minimize • Agent-curated dashboard
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
