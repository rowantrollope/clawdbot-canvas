import { useState, useEffect } from 'react';
import type { Card } from '../../types/card';
import { useCardStore } from '../../store/cardStore';
import { CardContent } from './CardContent';

interface CardContainerProps {
  card: Card;
}

export function CardContainer({ card }: CardContainerProps) {
  const { minimize, remove } = useCardStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // Animate in on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleMinimize = () => {
    setIsLeaving(true);
    setTimeout(() => {
      minimize(card.id);
    }, 200);
  };

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => {
      remove(card.id);
    }, 200);
  };

  const priorityIndicator = {
    high: 'bg-red-500',
    normal: 'bg-[#007AFF]',
    low: 'bg-[#86868b]',
  };

  return (
    <div
      className={`
        bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)]
        transition-all duration-200 ease-out
        hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)]
        ${isVisible && !isLeaving ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          {card.priority !== 'normal' && (
            <div className={`w-2 h-2 rounded-full ${priorityIndicator[card.priority]}`} />
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
          <button
            onClick={handleDismiss}
            className="w-6 h-6 flex items-center justify-center rounded-full text-[#86868b] hover:bg-red-50 hover:text-red-500 transition-colors duration-150"
            aria-label="Dismiss card"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <CardContent type={card.type} data={card.data} />
      </div>
    </div>
  );
}
