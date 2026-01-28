import { useState } from 'react';
import type { Card } from '../../types/card';
import { ArchivedCard } from './ArchivedCard';

interface ArchiveDrawerProps {
  cards: Card[];
  onRestore: (id: string) => void;
  onClearArchive?: () => void;
}

export function ArchiveDrawer({ cards, onRestore, onClearArchive }: ArchiveDrawerProps) {
  const [open, setOpen] = useState(false);

  if (cards.length === 0) return null;

  const updatedCount = cards.filter(c => c.updatedAt && c.archivedAt && c.updatedAt > c.archivedAt).length;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 text-[13px] text-[#86868b] hover:text-[#1d1d1f] transition-colors duration-150 px-1 py-1"
        >
          <svg
            className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
          </svg>
          Archive ({cards.length})
          {updatedCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] font-medium bg-[#007AFF] text-white rounded-full">
              {updatedCount} updated
            </span>
          )}
        </button>
        {open && onClearArchive && (
          <button
            onClick={onClearArchive}
            className="text-[12px] text-[#86868b] hover:text-red-500 transition-colors duration-150 px-2 py-1"
          >
            Clear All
          </button>
        )}
      </div>

      {open && (
        <div className="mt-2 bg-white/60 backdrop-blur-xl rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="divide-y divide-[#e5e5ea]/50">
            {cards.map((card) => (
              <ArchivedCard key={card.id} card={card} onRestore={onRestore} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
