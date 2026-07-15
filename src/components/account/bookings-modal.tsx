'use client';
import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { listMyBookings } from '@/app/account/booking-actions';
import { BookingsList, type AccountBooking } from '@/app/account/bookings-list';
import { t } from '@/lib/i18n/translations';

export function BookingsModal({ open, onClose, locale = 'en' }: { open: boolean; onClose: () => void; locale?: string }) {
  // Remount the content on every open so each visit starts fresh (re-fetches,
  // no stale rows from a previous session).
  if (!open) return null;
  return <BookingsModalContent onClose={onClose} locale={locale} />;
}

function BookingsModalContent({ onClose, locale }: { onClose: () => void; locale: string }) {
  const [rows, setRows] = useState<AccountBooking[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    listMyBookings().then((res) => {
      if (!alive) return;
      if (res.ok) setRows(res.bookings);
      else setError(res.message);
    });
    return () => { alive = false; };
  }, []);

  return (
    <Modal open onClose={onClose} title={t('My bookings', locale)} wide>
      {error ? (
        <p className="astatus astatus--err">{error}</p>
      ) : rows === null ? (
        <p className="step__hint">{t('Loading your bookings…', locale)}</p>
      ) : (
        <BookingsList bookings={rows} locale={locale} />
      )}
    </Modal>
  );
}
