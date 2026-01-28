import { useState, useEffect } from 'react';

interface WorldClockProps {
  cities?: Array<{
    name: string;
    timezone: string;
    emoji?: string;
  }>;
}

export function WorldClock({ cities }: WorldClockProps) {
  const [time, setTime] = useState(new Date());

  const defaultCities = cities || [
    { name: 'Tel Aviv', timezone: 'Asia/Jerusalem', emoji: '🇮🇱' },
    { name: 'San Francisco', timezone: 'America/Los_Angeles', emoji: '🇺🇸' },
  ];

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (tz: string) => {
    return time.toLocaleTimeString('en-US', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (tz: string) => {
    return time.toLocaleDateString('en-US', {
      timeZone: tz,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div style={{
      display: 'flex',
      gap: '32px',
      justifyContent: 'space-around',
      padding: '8px 0',
    }}>
      {defaultCities.map((city) => (
        <div key={city.timezone} style={{ textAlign: 'center', flex: 1 }}>
          <div style={{
            fontSize: '42px',
            fontWeight: '200',
            color: '#1d1d1f',
            letterSpacing: '-2px',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1.1,
          }}>
            {formatTime(city.timezone)}
          </div>
          <div style={{
            fontSize: '15px',
            color: '#1d1d1f',
            marginTop: '8px',
            fontWeight: '500',
          }}>
            {formatDate(city.timezone)}
          </div>
          <div style={{
            fontSize: '13px',
            color: '#86868b',
            marginTop: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
          }}>
            {city.emoji && <span>{city.emoji}</span>}
            {city.name}
          </div>
        </div>
      ))}
    </div>
  );
}
