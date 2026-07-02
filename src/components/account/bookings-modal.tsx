'use client';
import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { listMyBookings } from '@/app/account/booking-actions';
import { BookingsList, type AccountBooking } from '@/app/account/bookings-list';

export function BookingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  // Remount the content on every open so each visit starts fresh (re-fetches,
  // no stale rows from a previous session).
  if (!open) return null;
  return <BookingsModalContent onClose={onClose} />;
}

function BookingsModalContent({ onClose }: { onClose: () => void }) {
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
    <Modal open onClose={onClose} title="My bookings" wide>
      {error ? (
        <p className="astatus astatus--err">{error}</p>
      ) : rows === null ? (
        <p className="step__hint">Loading your bookings…</p>
      ) : (
        <BookingsList bookings={rows} />
      )}
    </Modal>
  );
}
