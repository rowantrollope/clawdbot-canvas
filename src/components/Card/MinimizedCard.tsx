import { useState, useEffect } from 'react';
import type { Card } from '../../types/card';
import { useCardStore } from '../../store/cardStore';
import { isProgressData } from '../../types/card';

interface MinimizedCardProps {
  card: Card;
}

export function MinimizedCard({ card }: MinimizedCardProps) {
  const { expand, dismiss } = useCardStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // Animate in on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleExpand = () => {
    setIsLeaving(true);
    setTimeout(() => {
      expand(card.id);
    }, 150);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Only dismiss if card is not persistent
    if (card.persistent) return;
    setIsLeaving(true);
    setTimeout(() => {
      dismiss(card.id);
    }, 150);
  };

  // Get a brief status for the pill
  const getStatusText = () => {
    if (card.type === 'progress' && isProgressData(card.data)) {
      return `${card.data.progress}%`;
    }
    return null;
  };

  const statusText = getStatusText();

  const priorityColors = {
    high: 'border-red-200 bg-red-50',
    normal: 'border-gray-200 bg-white',
    low: 'border-gray-200 bg-gray-50',
  };

  return (
    <button
      onClick={handleExpand}
      className={`
        group flex items-center gap-2 px-3 py-2 rounded-full
        border ${priorityColors[card.priority]}
        shadow-sm hover:shadow-md
        transition-all duration-150 ease-out
        ${isVisible && !isLeaving ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-90'}
      `}
    >
      {card.icon && <span className="text-sm">{card.icon}</span>}
      <span className="text-xs font-medium text-[#1d1d1f] whitespace-nowrap max-w-24 truncate">
        {card.title}
      </span>
      {statusText && (
        <span className="text-xs font-semibold text-[#007AFF]">{statusText}</span>
      )}
      {!card.persistent && (
        <span
          onClick={handleDismiss}
          className="w-4 h-4 flex items-center justify-center rounded-full text-[#86868b] opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-500 transition-all duration-150"
          aria-label="Dismiss card"
        >
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </span>
      )}
    </button>
  );
}
