'use client';
import { useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { staffSetBookingStatus } from '@/app/staff/staff-actions';
import { ConfirmSheet } from '@/components/staff/confirm-sheet';
import { RescheduleModal } from '@/components/staff/reschedule-modal';
import type { StaffBooking, AdminBookingStatus } from '@/lib/staff/view';

const TZ = 'Asia/Colombo';
const timeFmt = new Intl.DateTimeFormat('en-LK', { timeZone: TZ, hour: 'numeric', minute: '2-digit', hour12: true });
const STATUS_LABEL: Record<string, string> = {
  confirmed: 'Confirmed', completed: 'Completed', no_show: 'No-show', cancelled: 'Cancelled',
};

type PendingConfirm = { status: AdminBookingStatus; title: string; body: string; confirmLabel: string } | null;

export function StaffBookingCard({
  booking, serviceName, hero = false, allowUndo = false, onLocalChange, onLocalReschedule,
}: {
  booking: StaffBooking;
  serviceName: string;
  hero?: boolean;
  allowUndo?: boolean;
  onLocalChange: (id: string, status: AdminBookingStatus) => void;
  onLocalReschedule: (id: string, startsAt: string, endsAt: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<PendingConfirm>(null);
  const [moving, setMoving] = useState(false);

  const when = `${timeFmt.format(new Date(booking.starts_at))} – ${timeFmt.format(new Date(booking.ends_at))}`;

  async function setStatus(status: AdminBookingStatus) {
    if (busy) return;
    const prev = booking.status as AdminBookingStatus;
    setError(null); setBusy(true);
    onLocalChange(booking.id, status); // optimistic
    const res = await staffSetBookingStatus(booking.id, status);
    setBusy(false); setConfirm(null);
    if ('error' in res) {
      onLocalChange(booking.id, prev); // rollback
      setError(res.error || "Couldn't update. Try again.");
    }
  }

  const settled = booking.status !== 'confirmed';

  return (
    <div className={`sd-bk sd-bk--${booking.status}${hero ? ' sd-bk--hero' : ''}`}>
      <div className="sd-bk__rail" aria-hidden="true" />
      <div className="sd-bk__body">
        <div className="sd-bk__top">
          <div>
            <span className="sd-bk__time">{when}</span>
            <b className="sd-bk__name">{booking.customer_name}</b>
          </div>
          <span className={`tag tag--${booking.status}`}>{STATUS_LABEL[booking.status] ?? booking.status}</span>
        </div>

        <div className="sd-bk__meta">
          <span><Icon name="tag" className="ic" /> {serviceName}</span>
          <a className="sd-bk__phone" href={`tel:${booking.customer_phone}`}>
            <Icon name="phone" className="ic" /> {booking.customer_phone}
          </a>
        </div>

        {!!booking.notes && <p className="sd-bk__notes">{booking.notes}</p>}
        {error && <p className="sd-bk__err">{error}</p>}

        {!settled && (
          <div className="sd-bk__actions">
            <button className="btn btn--primary sd-act" disabled={busy} onClick={() => setStatus('completed')}>
              <Icon name="check" className="ic" /> Complete
            </button>
            <button className="btn btn--ghost sd-act" disabled={busy} onClick={() => setMoving(true)}>
              <Icon name="calendar" className="ic" /> Reschedule
            </button>
            <button className="btn btn--ghost sd-act" disabled={busy}
              onClick={() => setConfirm({
                status: 'no_show',
                title: 'Mark as no-show?',
                body: `${booking.customer_name} (${when}) didn't turn up. This is recorded on the booking.`,
                confirmLabel: 'Mark no-show',
              })}>
              <Icon name="user" className="ic" /> No-show
            </button>
            <button className="btn btn--ghost sd-act sd-act--danger" disabled={busy}
              onClick={() => setConfirm({
                status: 'cancelled',
                title: 'Cancel this booking?',
                body: `${booking.customer_name}'s ${serviceName} at ${when} will be cancelled and the customer will be emailed.`,
                confirmLabel: 'Cancel booking',
              })}>
              <Icon name="xmark" className="ic" /> Cancel
            </button>
          </div>
        )}

        {settled && allowUndo && (
          <div className="sd-bk__actions">
            <button className="btn btn--ghost sd-act" disabled={busy} onClick={() => setStatus('confirmed')}>
              Undo — back to confirmed
            </button>
          </div>
        )}
      </div>

      <ConfirmSheet
        open={confirm !== null}
        title={confirm?.title ?? ''}
        body={confirm?.body ?? ''}
        confirmLabel={confirm?.confirmLabel ?? ''}
        danger
        busy={busy}
        onConfirm={() => confirm && setStatus(confirm.status)}
        onClose={() => setConfirm(null)}
      />
      <RescheduleModal
        open={moving}
        booking={booking}
        onClose={() => setMoving(false)}
        onDone={(s, e) => onLocalReschedule(booking.id, s, e)}
      />
    </div>
  );
}
