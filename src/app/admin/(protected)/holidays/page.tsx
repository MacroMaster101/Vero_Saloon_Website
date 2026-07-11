import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/supabase/auth';
import type { Holiday } from '@/lib/supabase/types';
import { salonDayKey } from '@/lib/booking-rows';
import { HolidayForms } from '@/components/admin/holiday-form';
import { DeleteForm } from '@/components/admin/form-kit';
import { deleteHoliday } from './holiday-actions';

const dateFmt = new Intl.DateTimeFormat('en-LK', {
  timeZone: 'Asia/Colombo', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
});

function label(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number) as [number, number, number];
  return dateFmt.format(new Date(y, m - 1, d));
}

export default async function HolidaysPage() {
  await requireRole(['admin'], '/admin/holidays');
  const sb = await createClient();
  // Upcoming holidays (today onward), soonest first. Salon-local "today" —
  // toISOString() is UTC, which is 5:30 behind and would drop today's holiday
  // from midnight to 5:30 AM in Sri Lanka.
  const today = salonDayKey(new Date());
  const { data } = await sb
    .from('holidays')
    .select('*')
    .gte('date', today)
    .order('date');
  const rows = (data ?? []) as Holiday[];

  return (
    <div className="apage">
      <div className="ahead">
        <h1 className="ahead__title">Holidays</h1>
        <Link href="/admin" className="btn btn--ghost">Back to dashboard</Link>
      </div>
      <p className="lead" style={{ marginTop: 12 }}>
        Days the salon is closed. These are blocked on the booking calendar. Sync public &amp; poya
        holidays from Google, or add a salon-specific closure by hand.
      </p>

      <HolidayForms />

      <section style={{ marginTop: 40 }}>
        <h2 className="h-section" style={{ fontSize: 20, marginBottom: 12 }}>Upcoming closed days</h2>
        {rows.length === 0 ? (
          <p className="lead">No holidays yet — sync from Google or add one above.</p>
        ) : (
          <ul className="alist">
            {rows.map((h) => (
              <li key={h.date} className="arow arow--split">
                <div className="arow__main">
                  <b className="arow__name">{h.name}</b>
                  <span className="arow__meta">{label(h.date)}</span>
                  <span className="arow__meta">{h.source === 'google' ? 'From Google' : 'Added manually'}</span>
                </div>
                <DeleteForm action={deleteHoliday} id={h.date} name="date" label="Remove" />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
