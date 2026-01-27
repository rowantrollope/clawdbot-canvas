import { useState, useEffect } from 'react';
import type { Card } from '../../types/card';
import { useCardStore } from '../../store/cardStore';
import { isProgressData, isStatusData, isMarkdownData, isListData } from '../../types/card';

interface MinimizedCardProps {
  card: Card;
}

function getSummary(card: Card): string {
  const { data } = card;
  if (isProgressData(data)) {
    return `${data.label} — ${data.progress}%`;
  }
  if (isStatusData(data)) {
    return data.entries.map((e) => `${e.key}: ${e.value}`).join(' · ');
  }
  if (isMarkdownData(data)) {
    // First non-empty, non-heading line
    const line = data.content.split('\n').find((l) => l.trim() && !l.startsWith('#'));
    return line?.replace(/[*_`#\-]/g, '').trim() || 'Markdown content';
  }
  if (isListData(data)) {
    const done = data.items.filter((i) => i.done).length;
    return `${done}/${data.items.length} complete`;
  }
  return '';
}

export function MinimizedCard({ card }: MinimizedCardProps) {
  const { expand, dismiss } = useCardStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleExpand = () => {
    setIsLeaving(true);
    setTimeout(() => expand(card.id), 200);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (card.persistent) return;
    setIsLeaving(true);
    setTimeout(() => dismiss(card.id), 200);
  };

  const accentColor = {
    high: '#FF3B30',
    normal: '#007AFF',
    low: '#86868b',
  }[card.priority];

  const summary = getSummary(card);

  return (
    <button
      onClick={handleExpand}
      className={`
        group w-full text-left bg-white/80 backdrop-blur-xl rounded-2xl
        shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden
        transition-all duration-200 ease-out cursor-pointer
        hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)]
        ${isVisible && !isLeaving ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
    >
      <div className="h-[2px]" style={{ backgroundColor: accentColor }} />
      <div className="flex items-center gap-3 px-4 py-2.5">
        {card.icon && <span className="text-base flex-shrink-0">{card.icon}</span>}
        <div className="flex-1 min-w-0">
          <h4 className="text-[13px] font-semibold text-[#1d1d1f] truncate">{card.title}</h4>
          {summary && (
            <p className="text-[12px] text-[#86868b] truncate">{summary}</p>
          )}
        </div>
        {!card.persistent && (
          <span
            onClick={handleDismiss}
            className="w-5 h-5 flex items-center justify-center rounded-full text-[#86868b] opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-500 transition-all duration-150 flex-shrink-0"
            aria-label="Dismiss card"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </span>
        )}
      </div>
    </button>
  );
}
