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

function formatTime(timeStr: string): string {
  const date = new Date(timeStr);
  if (isNaN(date.getTime())) return timeStr; // Return as-is if not a valid date
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function isEventPast(endTime: string): boolean {
  const endDate = new Date(endTime);
  return !isNaN(endDate.getTime()) && endDate < new Date();
}

export function CalendarCard({ date, events }: CalendarCardProps) {
  return (
    <div className="space-y-3">
      <div className="text-lg font-medium text-[#86868b]">
        {formatDate(date)}
      </div>
      {events.length === 0 ? (
        <div className="text-lg text-[#86868b] italic py-2">
          No events scheduled
        </div>
      ) : (
        <div className="space-y-0.5">
          {events.map((event) => {
            const isPast = isEventPast(event.endTime);
            return (
              <div key={event.id} className="flex items-center gap-3 py-1">
                <div
                  className="w-1 h-8 rounded-full flex-shrink-0"
                  style={{ backgroundColor: isPast ? '#d1d1d6' : event.color }}
                />
                <div className="min-w-0 flex-1">
                  <div className={`text-lg font-medium truncate ${isPast ? 'text-[#c7c7cc]' : 'text-[#1d1d1f]'}`}>
                    {event.title}
                  </div>
                  <div className={`text-base ${isPast ? 'text-[#d1d1d6]' : 'text-[#86868b]'}`}>
                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
