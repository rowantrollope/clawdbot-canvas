export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  color: string;
}

export interface CalendarCardProps {
  date: string;
  events: CalendarEvent[];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function CalendarCard({ date, events }: CalendarCardProps) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-[#86868b]">
        {formatDate(date)}
      </div>
      {events.length === 0 ? (
        <div className="text-sm text-[#86868b] italic py-2">
          No events scheduled
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <div key={event.id} className="flex items-center gap-3 py-2">
              <div
                className="w-1 h-8 rounded-full flex-shrink-0"
                style={{ backgroundColor: event.color }}
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-[#1d1d1f] truncate">
                  {event.title}
                </div>
                <div className="text-xs text-[#86868b]">
                  {event.startTime} - {event.endTime}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
