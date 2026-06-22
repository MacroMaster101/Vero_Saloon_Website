'use client';
import { useEffect, useState, useTransition } from 'react';
import { Icon } from '@/components/ui/icon';
import { getAvailability } from '@/app/book/actions';
import { cancelMyBooking, rescheduleMyBooking } from './booking-actions';
import { RateBooking } from '@/components/account/rate-booking';

export type AccountBooking = {
  id: string;
  reference: string;
  starts_at: string;
  status: string;
  service_id: string;
  stylist_id: string | null;
};

const TZ = 'Asia/Colombo';
const whenFmt = new Intl.DateTimeFormat('en-LK', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true });
const slotFmt = new Intl.DateTimeFormat('en-LK', { timeZone: TZ, hour: 'numeric', minute: '2-digit', hour12: true });
const TAG_CLASS: Record<string, string> = { confirmed: 'tag--confirmed', completed: 'tag--completed', no_show: 'tag--no_show', cancelled: 'tag--cancelled' };

// Next 7 salon-local days as YYYY-MM-DD value + short label.
function buildDates(): { value: string; label: string }[] {
  const out: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    out.push({ value, label: i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }) });
  }
  return out;
}

function slotLabel(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const d = new Date(Date.UTC(2000, 0, 1, h!, m!));
  return slotFmt.format(d);
}

export function BookingsList({ bookings }: { bookings: AccountBooking[] }) {
  const [items, setItems] = useState<AccountBooking[]>(bookings);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rateId, setRateId] = useState<string | null>(null);
  const [ratedIds, setRatedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [busy, startBusy] = useTransition();
  // Capture "now" once so render stays pure; a session won't meaningfully cross
  // the boundary, and actions re-verify the time server-side anyway.
  const [now] = useState(() => Date.now());

  function upcomingConfirmed(b: AccountBooking) {
    return b.status === 'confirmed' && new Date(b.starts_at).getTime() >= now;
  }

  function canReview(b: AccountBooking) {
    return b.status === 'completed' && b.stylist_id && !ratedIds.has(b.id);
  }

  function cancel(b: AccountBooking) {
    if (!window.confirm(`Cancel booking ${b.reference}?`)) return;
    setError(null);
    startBusy(async () => {
      const res = await cancelMyBooking(b.id);
      if (res.ok) setItems((list) => list.map((x) => (x.id === b.id ? { ...x, status: 'cancelled' } : x)));
      else setError(res.message);
    });
  }

  if (items.length === 0) return <p className="step__hint">No bookings yet.</p>;

  return (
    <div style={{ maxWidth: 560 }}>
      {error && <p className="step__hint" style={{ color: 'var(--error)' }}>{error}</p>}
      <ul className="bk-list">
        {items.map((b) => (
          <li key={b.id} className="bk-card" style={{ flexWrap: 'wrap' }}>
            <span className="bk-card__ic"><Icon name="scissors" className="ic-lg" /></span>
            <div className="bk-card__info"><b>{b.reference}</b><span>{whenFmt.format(new Date(b.starts_at))}</span></div>
            <span className={`tag ${TAG_CLASS[b.status] ?? ''}`} style={{ marginLeft: 'auto' }}>{b.status}</span>
            {upcomingConfirmed(b) && (
              <div className="bk-card__actions">
                <button type="button" className="btn btn--ghost" disabled={busy} onClick={() => { setError(null); setRescheduleId(rescheduleId === b.id ? null : b.id); }}>
                  <Icon name="calendar" className="ic" /> Reschedule
                </button>
                <button type="button" className="btn btn--ghost" disabled={busy} onClick={() => cancel(b)}>
                  <Icon name="xmark" className="ic" /> Cancel
                </button>
              </div>
            )}
            {canReview(b) && (
              <div className="bk-card__actions">
                <button type="button" className="btn btn--ghost" onClick={() => { setError(null); setRateId(rateId === b.id ? null : b.id); }}>
                  <Icon name="check" className="ic" /> Rate your stylist
                </button>
              </div>
            )}
            {rateId === b.id && (
              <RateBooking
                bookingId={b.id}
                onClose={() => setRateId(null)}
                onDone={() => { setRatedIds((s) => new Set(s).add(b.id)); setRateId(null); }}
              />
            )}
            {rescheduleId === b.id && (
              <ReschedulePanel
                booking={b}
                busy={busy}
                onClose={() => setRescheduleId(null)}
                onDone={(startsAt) => {
                  setItems((list) => list.map((x) => (x.id === b.id ? { ...x, starts_at: startsAt } : x)));
                  setRescheduleId(null);
                }}
                onError={setError}
                startBusy={startBusy}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReschedulePanel({
  booking, busy, onClose, onDone, onError, startBusy,
}: {
  booking: AccountBooking;
  busy: boolean;
  onClose: () => void;
  onDone: (startsAt: string) => void;
  onError: (msg: string | null) => void;
  startBusy: (cb: () => Promise<void>) => void;
}) {
  const [dates] = useState(buildDates);
  const [date, setDate] = useState<string>(dates[0]!.value);
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, startLoad] = useTransition();
  const [time, setTime] = useState<string | null>(null);

  function loadSlots(d: string) {
    startLoad(async () => {
      const res = await getAvailability({ serviceId: booking.service_id, stylistId: booking.stylist_id, date: d });
      setSlots(res.slots);
    });
  }

  function pickDate(d: string) {
    setDate(d);
    setTime(null);
    onError(null);
    loadSlots(d);
  }

  // Load slots for the initial date when the panel opens.
  useEffect(() => {
    loadSlots(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function confirm() {
    if (!time) return;
    onError(null);
    startBusy(async () => {
      const res = await rescheduleMyBooking(booking.id, date, time);
      if (res.ok) {
        // Recompute the local starts_at for immediate display.
        const [h, m] = time.split(':').map(Number);
        const d = new Date(`${date}T00:00:00+05:30`);
        d.setUTCMinutes(d.getUTCMinutes() + h! * 60 + m!);
        onDone(d.toISOString());
      } else {
        onError(res.message);
      }
    });
  }

  return (
    <div className="bk-resched" style={{ flexBasis: '100%' }}>
      <div className="bk-resched__dates">
        {dates.map((d) => (
          <button key={d.value} type="button" className={`date-chip${date === d.value ? ' sel' : ''}`} onClick={() => pickDate(d.value)}>
            {d.label}
          </button>
        ))}
      </div>
      {loading ? (
        <p className="step__hint">Loading times…</p>
      ) : slots.length === 0 ? (
        <p className="step__hint">No open times that day. Pick another date.</p>
      ) : (
        <div className="bk-resched__slots">
          {slots.map((s) => (
            <button key={s} type="button" className={`slot${time === s ? ' sel' : ''}`} onClick={() => setTime(s)}>
              {slotLabel(s)}
            </button>
          ))}
        </div>
      )}
      <div className="bk-resched__actions">
        <button type="button" className="btn btn--ghost" onClick={onClose} disabled={busy}>Close</button>
        <button type="button" className="btn btn--primary" onClick={confirm} disabled={!time || busy}>
          {busy ? 'Saving…' : 'Confirm new time'}
        </button>
      </div>
    </div>
  );
}
