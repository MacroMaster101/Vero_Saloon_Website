'use client';

import { useEffect, useState } from 'react';
import type { BusinessHour } from '@/lib/supabase/types';

export function LiveStatus({ hours }: { hours: BusinessHour[] }) {
  const [status, setStatus] = useState<'open' | 'closed' | 'loading'>('loading');

  useEffect(() => {
    const checkOpen = () => {
      // Get Sri Lanka time (UTC+5:30)
      const now = new Date();
      // UTC time
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      // Sri Lanka time is UTC + 5.5 hours
      const lkTime = new Date(utc + 3600000 * 5.5);
      
      const day = lkTime.getDay(); // 0-6 (Sun-Sat)
      const minutes = lkTime.getHours() * 60 + lkTime.getMinutes();

      const dayHour = hours.find((h) => h.day_of_week === day);
      if (!dayHour || dayHour.is_closed) {
        setStatus('closed');
        return;
      }

      if (minutes >= dayHour.open_minute && minutes < dayHour.close_minute) {
        setStatus('open');
      } else {
        setStatus('closed');
      }
    };

    checkOpen();
    const interval = setInterval(checkOpen, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [hours]);

  if (status === 'loading') {
    return (
      <div className="live-status-badge live-status-badge--closed">
        <span className="live-status-dot" />
        <span>Checking Status...</span>
      </div>
    );
  }

  if (status === 'open') {
    return (
      <div className="live-status-badge live-status-badge--open">
        <span className="live-status-dot" />
        <span>Open Now</span>
      </div>
    );
  }

  return (
    <div className="live-status-badge live-status-badge--closed">
      <span className="live-status-dot" />
      <span>Closed</span>
    </div>
  );
}
