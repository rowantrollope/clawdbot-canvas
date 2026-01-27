import { useRef, useEffect, useState, useCallback } from 'react';
import { MinimizedCard } from './MinimizedCard';
import type { Card } from '@/types/card';

interface MinimizedStackProps {
  cards: Card[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

const CARD_HEIGHT = 56;
const STACKED_OFFSET = 20; // px visible per card when stacked (cascade)
const UNSTACKED_GAP = 6;   // gap between cards when fully unstacked

export function MinimizedStack({ cards, scrollRef }: MinimizedStackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // 0 = fully stacked (cascade), 1 = fully unstacked
  const [spread, setSpread] = useState(0);

  const updateSpread = useCallback(() => {
    const scrollEl = scrollRef.current;
    const containerEl = containerRef.current;
    if (!scrollEl || !containerEl) return;

    const scrollRect = scrollEl.getBoundingClientRect();
    const containerRect = containerEl.getBoundingClientRect();

    // How far the top of the stack is from the bottom of the scroll viewport
    // When the stack top is at the scroll bottom → 0 (stacked)
    // When the stack is fully visible → 1 (unstacked)
    const stackFullHeight = cards.length * (CARD_HEIGHT + UNSTACKED_GAP);
    const visibleTop = Math.max(containerRect.top, scrollRect.top);
    const visibleBottom = Math.min(containerRect.top + stackFullHeight, scrollRect.bottom);
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);

    const ratio = Math.min(1, Math.max(0, visibleHeight / stackFullHeight));
    setSpread(ratio);
  }, [cards.length, scrollRef]);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    // Initial calculation
    updateSpread();

    scrollEl.addEventListener('scroll', updateSpread, { passive: true });
    window.addEventListener('resize', updateSpread);
    return () => {
      scrollEl.removeEventListener('scroll', updateSpread);
      window.removeEventListener('resize', updateSpread);
    };
  }, [updateSpread, scrollRef]);

  // Also recalculate when cards change
  useEffect(() => {
    updateSpread();
  }, [cards.length, updateSpread]);

  const total = cards.length;
  // Interpolated offset per card: stacked = STACKED_OFFSET, unstacked = CARD_HEIGHT + UNSTACKED_GAP
  const offsetPerCard = STACKED_OFFSET + spread * (CARD_HEIGHT + UNSTACKED_GAP - STACKED_OFFSET);
  const containerHeight = CARD_HEIGHT + (total - 1) * offsetPerCard;

  return (
    <div className="pt-4 mt-2">
      <div className="flex items-center gap-2 mb-2 px-1">
        <div className="h-px flex-1 bg-[#e5e5ea]" />
        <span className="text-[11px] font-medium text-[#86868b] uppercase tracking-wider">
          Minimized
        </span>
        <div className="h-px flex-1 bg-[#e5e5ea]" />
      </div>
      <div
        ref={containerRef}
        style={{ position: 'relative', height: containerHeight }}
      >
        {cards.map((card, index) => {
          const top = index * offsetPerCard;
          const scale = 1 - (1 - spread) * index * 0.015;
          return (
            <MinimizedCard
              key={card.id}
              card={card}
              style={{
                position: 'absolute',
                top,
                left: 0,
                right: 0,
                zIndex: total - index,
                transform: `scale(${scale})`,
                transformOrigin: 'top center',
                transition: 'top 150ms ease-out, transform 150ms ease-out',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
