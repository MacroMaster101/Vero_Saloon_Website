'use client';
import { useEffect, useState } from 'react';
import { readGuestBookings, type GuestBooking } from '@/lib/guest-bookings';
import { Icon } from '@/components/ui/icon';

const TAG_CLASS: Record<string, string> = {
  confirmed: 'tag--confirmed', completed: 'tag--completed', cancelled: 'tag--cancelled',
};

// Shows this browser's recently-booked guest visits. Reads localStorage on mount
// (so it stays empty during SSR and hydrates client-side). `refreshKey` lets the
// wizard nudge a re-read after a new guest booking is saved.
export function GuestRecentBookings({ refreshKey = 0 }: { refreshKey?: number }) {
  const [bookings, setBookings] = useState<GuestBooking[]>([]);

  useEffect(() => {
    // Hydrate from localStorage after mount (it's unavailable during SSR).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBookings(readGuestBookings());
  }, [refreshKey]);

  if (bookings.length === 0) return null;

  return (
    <section className="guest-recent" aria-label="Your recent bookings">
      <h3 className="h-section" style={{ fontSize: 18, marginBottom: 12 }}>Your recent bookings</h3>
      <p className="step__hint" style={{ marginTop: -6 }}>
        Saved on this device. Sign up with your email to manage them anywhere.
      </p>
      <ul className="bk-list" style={{ maxWidth: 560 }}>
        {bookings.map((b) => (
          <li key={b.reference} className="bk-card">
            <span className="bk-card__ic"><Icon name="scissors" className="ic-lg" /></span>
            <div className="bk-card__info">
              <b>{b.reference}</b>
              <span>{b.serviceName} · {b.whenLabel}</span>
            </div>
            <span className={`tag ${TAG_CLASS[b.status] ?? ''}`} style={{ marginLeft: 'auto' }}>{b.status}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
