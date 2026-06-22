'use client';
import { useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { staffSetBookingStatus } from '@/app/staff/staff-actions';
import type { StaffBooking, AdminBookingStatus } from '@/lib/staff/view';

const TZ = 'Asia/Colombo';
const timeFmt = new Intl.DateTimeFormat('en-LK', { timeZone: TZ, hour: 'numeric', minute: '2-digit', hour12: true });
const TAG_CLASS: Record<string, string> = {
  confirmed: 'tag--confirmed', completed: 'tag--completed', no_show: 'tag--no_show', cancelled: 'tag--cancelled',
};

function timeRange(startsAt: string, endsAt: string): string {
  return `${timeFmt.format(new Date(startsAt))} – ${timeFmt.format(new Date(endsAt))}`;
}

export function StaffBookingCard({
  booking,
  serviceName,
  allowUndo,
  onLocalChange,
}: {
  booking: StaffBooking;
  serviceName: string;
  allowUndo?: boolean;
  onLocalChange: (id: string, status: AdminBookingStatus) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function setStatus(status: AdminBookingStatus, confirmText?: string) {
    if (busy) return;
    if (confirmText && !window.confirm(confirmText)) return;
    const prev = booking.status as AdminBookingStatus;
    setError(null);
    setBusy(true);
    onLocalChange(booking.id, status); // optimistic
    const res = await staffSetBookingStatus(booking.id, status);
    setBusy(false);
    if ('error' in res) {
      onLocalChange(booking.id, prev); // rollback
      setError("Couldn't update. Try again.");
    }
  }

  return (
    <div className={`staff-bk staff-bk--${booking.status}`}>
      <div className="staff-bk__top">
        <div className="staff-bk__head">
          <span className="staff-bk__time">{timeRange(booking.starts_at, booking.ends_at)}</span>
          <b className="staff-bk__name">{booking.customer_name}</b>
        </div>
        <span className={`tag ${TAG_CLASS[booking.status] ?? ''}`}>{booking.status}</span>
      </div>

      <div className="staff-bk__meta">
        <span><Icon name="tag" className="ic" /> {serviceName}</span>
        <a className="staff-bk__phone" href={`tel:${booking.customer_phone}`}>
          <Icon name="phone" className="ic" /> {booking.customer_phone}
        </a>
      </div>

      {!!booking.notes && <p className="staff-bk__notes">{booking.notes}</p>}
      {error && <p className="staff-bk__err">{error}</p>}

      {allowUndo && booking.status !== 'confirmed' && (
        <div className="staff-bk__actions">
          <button className="btn btn--ghost" disabled={busy} onClick={() => setStatus('confirmed')}>
            Undo to confirmed
          </button>
        </div>
      )}

      {booking.status === 'confirmed' && (
        <div className="staff-bk__actions">
          <button className="btn btn--ghost" disabled={busy} onClick={() => setStatus('completed')}>
            <Icon name="check" className="ic" /> Complete
          </button>
          <button className="btn btn--ghost" disabled={busy} onClick={() => setStatus('no_show')}>
            <Icon name="user" className="ic" /> No-show
          </button>
          <button className="btn btn--ghost" disabled={busy}
            onClick={() => setStatus('cancelled', `Cancel booking ${booking.reference}?`)}>
            <Icon name="xmark" className="ic" /> Cancel
          </button>
        </div>
      )}
    </div>
  );
}
