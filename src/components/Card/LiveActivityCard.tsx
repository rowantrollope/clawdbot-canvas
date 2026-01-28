import { useState, useEffect } from 'react';
import type { Card } from '../../types/card';
import { isProgressData } from '../../types/card';
import { useCardStore } from '../../store/cardStore';
import { CardContent } from './CardContent';

interface LiveActivityCardProps {
  card: Card;
}

export function LiveActivityCard({ card }: LiveActivityCardProps) {
  const { minimize, dismiss } = useCardStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleMinimize = () => {
    setIsLeaving(true);
    setTimeout(() => minimize(card.id), 200);
  };

  const handleDismiss = () => {
    if (card.persistent) return;
    setIsLeaving(true);
    setTimeout(() => {
      dismiss(card.id);
      // Tell server to archive this card
      const token = window.__CLAWDBOT_CANVAS_TOKEN;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      fetch(`/api/cards/${encodeURIComponent(card.id)}/archive`, { method: 'POST', headers }).catch(() => {});
    }, 200);
  };

  const accentColor = {
    high: '#1d1d1f',
    normal: '#1d1d1f',
    low: '#1d1d1f',
  }[card.priority];

  // Show pulsing indicator for active progress cards
  const isLive = isProgressData(card.data) && card.data.status === 'active';

  return (
    <div
      className={`
        bg-white/80 backdrop-blur-xl rounded-[20px]
        shadow-[0_2px_12px_rgba(0,0,0,0.08)] overflow-hidden
        transition-all duration-200 ease-out
        hover:shadow-[0_4px_20px_rgba(0,0,0,0.12)]
        ${isVisible && !isLeaving ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}
      `}
    >
      {/* Top accent line */}
      <div className="h-[3px]" style={{ backgroundColor: accentColor }} />

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34c759] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#34c759]" />
            </span>
          )}
          {card.icon && <span className="text-base">{card.icon}</span>}
          <h3 className="text-sm font-semibold text-[#1d1d1f]">{card.title}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleMinimize}
            className="w-6 h-6 flex items-center justify-center rounded-full text-[#86868b] hover:bg-gray-100 hover:text-[#1d1d1f] transition-colors duration-150"
            aria-label="Minimize card"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          {!card.persistent ? (
            <button
              onClick={handleDismiss}
              className="w-6 h-6 flex items-center justify-center rounded-full text-[#86868b] hover:bg-red-50 hover:text-red-500 transition-colors duration-150"
              aria-label="Dismiss card"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : (
            <div
              className="w-6 h-6 flex items-center justify-center rounded-full text-[#86868b]"
              title="This card is persistent"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C9.24 2 7 4.24 7 7v3H6c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2h-1V7c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3v3H9V7c0-1.66 1.34-3 3-3z" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <CardContent type={card.type} data={card.data} />
      </div>
    </div>
  );
}
