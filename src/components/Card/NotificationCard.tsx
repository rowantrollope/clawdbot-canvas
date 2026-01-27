import { useState, useEffect } from 'react';
import type { Card } from '../../types/card';
import { isNotificationData } from '../../types/card';
import { useCardStore } from '../../store/cardStore';
import { getRelativeTime } from '../../lib/timeUtils';

interface NotificationCardProps {
  card: Card;
}

export function NotificationCard({ card }: NotificationCardProps) {
  const { dismiss } = useCardStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    if (card.persistent) return;
    setIsLeaving(true);
    setTimeout(() => dismiss(card.id), 200);
  };

  const data = isNotificationData(card.data) ? card.data : null;
  const appName = data?.appName ?? 'Clawdbot';
  const body = data?.body ?? '';
  const timestamp = data?.timestamp ?? card.createdAt;

  return (
    <div
      onClick={handleDismiss}
      className={`
        group bg-white/80 backdrop-blur-xl rounded-[20px]
        shadow-[0_2px_12px_rgba(0,0,0,0.08)]
        transition-all duration-200 ease-out cursor-pointer
        hover:shadow-[0_4px_20px_rgba(0,0,0,0.12)]
        ${isVisible && !isLeaving ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}
      `}
    >
      <div className="px-4 py-3">
        {/* Header: icon + app name + time */}
        <div className="flex items-center gap-1.5 mb-0.5">
          {card.icon && <span className="text-xs">{card.icon}</span>}
          <span className="text-xs font-medium text-[#86868b] uppercase tracking-wide">
            {appName}
          </span>
          <span className="text-xs text-[#86868b]">·</span>
          <span className="text-xs text-[#86868b]">{getRelativeTime(timestamp)}</span>
        </div>

        {/* Title */}
        <h3 className="text-[13px] font-semibold text-[#1d1d1f] leading-tight">{card.title}</h3>

        {/* Body - 2 line clamp */}
        {body && (
          <p className="text-[13px] text-[#3a3a3c] leading-snug mt-0.5 line-clamp-2">{body}</p>
        )}
      </div>
    </div>
  );
}
