'use client';
import { useEffect, useState, useTransition } from 'react';
import { Modal } from '@/components/ui/modal';
import { staffRescheduleOptions, staffRescheduleBooking } from '@/app/staff/staff-actions';
import { colomboDayKey, type StaffBooking } from '@/lib/staff/view';

// Pick a new date + open slot for a confirmed booking. Slots come from the
// same availability engine as customer booking (hours, holidays, conflicts).
export function RescheduleModal({
  open, booking, onClose, onDone,
}: {
  open: boolean;
  booking: StaffBooking;
  onClose: () => void;
  onDone: (startsAt: string, endsAt: string) => void;
}) {
  const [date, setDate] = useState(colomboDayKey());
  const [slots, setSlots] = useState<string[] | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSlots(null); setPicked(null); setError(null);
    let stale = false;
    (async () => {
      const res = await staffRescheduleOptions(booking.id, date);
      if (stale) return;
      if ('error' in res) { setError(res.error); setSlots([]); }
      else setSlots(res.slots);
    })();
    return () => { stale = true; };
  }, [open, date, booking.id]);

  function confirm() {
    if (!picked) return;
    setError(null);
    start(async () => {
      const res = await staffRescheduleBooking(booking.id, date, picked);
      if ('error' in res) { setError(res.error); return; }
      onDone(res.startsAt, res.endsAt);
      onClose();
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={`Move ${booking.customer_name}'s visit`}>
      <label className="pm__field">
        <span>New date</span>
        <input type="date" value={date} min={colomboDayKey()} onChange={(e) => setDate(e.target.value)} />
      </label>

      <div className="sd-slots" aria-live="polite">
        {slots === null && <p className="pm__hint">Checking openings…</p>}
        {slots?.length === 0 && !error && <p className="pm__hint">No open times that day — try another date.</p>}
        {slots?.map((s) => (
          <button
            key={s}
            type="button"
            className={`sd-slot${picked === s ? ' is-picked' : ''}`}
            onClick={() => setPicked(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {error && <p className="astatus astatus--err">{error}</p>}

      <div className="pm__foot" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn--ghost" onClick={onClose} disabled={pending}>Cancel</button>
        <button type="button" className="btn btn--primary" onClick={confirm} disabled={pending || !picked}>
          {pending ? 'Moving…' : picked ? `Move to ${picked}` : 'Pick a time'}
        </button>
      </div>
    </Modal>
  );
}
