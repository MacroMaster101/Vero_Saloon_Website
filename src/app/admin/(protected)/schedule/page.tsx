import { requireRole } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { toUtcInstant } from '@/lib/time';
import { SALON_TZ, salonDayKey } from '@/lib/booking-rows';
import { ScheduleList, type SchedRow } from './schedule-list';

const TZ = 'Asia/Colombo';
const whenFmt = new Intl.DateTimeFormat('en-LK', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short' });
const timeFmt = new Intl.DateTimeFormat('en-LK', { timeZone: TZ, hour: 'numeric', minute: '2-digit', hour12: true });

export default async function SchedulePage() {
  await requireRole(['admin'], '/admin/schedule');
  const sb = await createClient();
  // From the start of today forward. Without a filter this fetched EVERY booking
  // ever: PostgREST caps the response (default 1000 rows) AFTER sorting, so once
  // the salon passed 1000 lifetime bookings the page silently showed the 1000
  // OLDEST and hid every upcoming one — the rows this screen exists to show.
  const { data } = await sb.from('bookings')
    .select('id, reference, starts_at, customer_name, status')
    .gte('starts_at', toUtcInstant(salonDayKey(new Date()), 0, SALON_TZ))
    .order('starts_at', { ascending: true });

  const rows: SchedRow[] = ((data ?? []) as Array<{ id: string; reference: string; starts_at: string; customer_name: string; status: string }>).map((b) => {
    const d = new Date(b.starts_at);
    const t = timeFmt.format(d); // e.g. "2:30 PM"
    const parts = t.split(/\s+/);
    const timeLabel = parts[0] ?? '';
    const ampm = parts[1] ?? '';
    return { id: b.id, reference: b.reference, whenLabel: whenFmt.format(d), timeLabel, ampm, customer: b.customer_name, status: b.status };
  });

  return (
    <div className="apage">
      <div className="ahead">
        <div>
          <span className="eyebrow">Overview</span>
          <h1 className="ahead__title">Schedule</h1>
        </div>
      </div>
      <p className="step__hint" style={{ marginBottom: 14 }}>All salon appointments.</p>
      {rows.length === 0 ? <p className="step__hint">No bookings.</p> : <ScheduleList rows={rows} />}
    </div>
  );
}
