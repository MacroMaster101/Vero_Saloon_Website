'use client';
import { useEffect, useState } from 'react';
import { readGuestBookings, type GuestBooking } from '@/lib/guest-bookings';
import { Icon } from '@/components/ui/icon';
import { t } from '@/lib/i18n/translations';

const TAG_CLASS: Record<string, string> = {
  confirmed: 'tag--confirmed', completed: 'tag--completed', cancelled: 'tag--cancelled',
};

// Shows this browser's recently-booked guest visits. Reads localStorage on mount
// (so it stays empty during SSR and hydrates client-side). `refreshKey` lets the
// wizard nudge a re-read after a new guest booking is saved.
export function GuestRecentBookings({ refreshKey = 0, locale = 'en' }: { refreshKey?: number; locale?: string }) {
  const [bookings, setBookings] = useState<GuestBooking[]>([]);

  useEffect(() => {
    // Hydrate from localStorage after mount (it's unavailable during SSR).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBookings(readGuestBookings());
  }, [refreshKey]);

  if (bookings.length === 0) return null;

  return (
    <section className="guest-recent" aria-label={t('Your recent bookings', locale)}>
      <h3 className="h-section" style={{ fontSize: 18, marginBottom: 12 }}>{t('Your recent bookings', locale)}</h3>
      <p className="step__hint" style={{ marginTop: -6 }}>
        {t('Saved on this device. Sign up with your email to manage them anywhere.', locale)}
      </p>
      <ul className="bk-list" style={{ maxWidth: 560 }}>
        {bookings.map((b) => (
          <li key={b.reference} className="bk-card">
            <span className="bk-card__ic"><Icon name="scissors" className="ic-lg" /></span>
            <div className="bk-card__info">
              <b>{b.reference}</b>
              <span>{b.serviceName} · {b.whenLabel}</span>
            </div>
            <span className={`tag ${TAG_CLASS[b.status] ?? ''}`} style={{ marginLeft: 'auto' }}>{t(b.status, locale)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
