import type { Card } from '../../types/card';

interface ArchivedCardProps {
  card: Card;
  onRestore: (id: string) => void;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ArchivedCard({ card, onRestore }: ArchivedCardProps) {
  const hasUpdates = card.updatedAt && card.archivedAt && card.updatedAt > card.archivedAt;

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-black/[0.03] transition-colors duration-150 group">
      {card.icon && <span className="text-sm flex-shrink-0">{card.icon}</span>}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-medium text-[#1d1d1f] truncate">{card.title}</p>
          {hasUpdates && (
            <span className="flex-shrink-0 w-2 h-2 bg-[#007AFF] rounded-full" title="Updated since archived" />
          )}
        </div>
        {card.archivedAt && (
          <p className="text-[11px] text-[#86868b]">
            {formatDate(card.archivedAt)}
            {hasUpdates && <span className="text-[#007AFF]"> · updated</span>}
          </p>
        )}
      </div>
      <button
        onClick={() => onRestore(card.id)}
        className="text-[12px] font-medium text-[#007AFF] opacity-0 group-hover:opacity-100 transition-opacity duration-150 px-2 py-1 rounded-lg hover:bg-[#007AFF]/10 flex-shrink-0"
      >
        Restore
      </button>
    </div>
  );
}
