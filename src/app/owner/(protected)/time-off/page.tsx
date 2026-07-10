import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/supabase/auth';
import { getStylists } from '@/lib/queries';
import type { Holiday, BlockedSlot } from '@/lib/supabase/types';
import { HolidayForms } from '@/components/admin/holiday-form';
import { BlockForm } from '@/components/admin/block-form';
import { DeleteForm } from '@/components/admin/form-kit';
import { deleteHoliday } from '@/app/admin/(protected)/holidays/holiday-actions';
import { deleteBlock } from '@/app/admin/(protected)/blocked-slots/block-actions';
import { salonDayKey } from '@/lib/booking-rows';
import { Icon } from '@/components/ui/icon';

const dateFmt = new Intl.DateTimeFormat('en-LK', {
  timeZone: 'Asia/Colombo', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
});

function label(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number) as [number, number, number];
  return dateFmt.format(new Date(y, m - 1, d));
}

const TZ = 'Asia/Colombo';
const whenFmt = new Intl.DateTimeFormat('en-LK', {
  timeZone: TZ,
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

type BlockRow = BlockedSlot & { stylists: { name: string } | null };

export default async function OwnerTimeOffPage() {
  await requireRole(['owner', 'admin'], '/owner/time-off');
  const sb = await createClient();
  // Salon-local "today" — toISOString() is UTC (5:30 behind Colombo) and would
  // drop today's holiday from the list between midnight and 5:30 AM.
  const today = salonDayKey(new Date());
  const [{ data: holidayData }, { data: blockData }, stylists] = await Promise.all([
    sb
      .from('holidays')
      .select('*')
      .gte('date', today)
      .order('date'),
    sb
      .from('blocked_slots')
      .select('*, stylists(name)')
      .gt('ends_at', new Date().toISOString())
      .order('starts_at'),
    getStylists(),
  ]);
  const holidays = (holidayData ?? []) as Holiday[];
  const blocks = (blockData ?? []) as unknown as BlockRow[];

  return (
    <div>
      <Link href="/owner" className="oback"><Icon name="arrowLeft" className="ic" /> Home</Link>
      <h1 className="opage__title">Days off &amp; blocks</h1>
      <p className="opage__hint">Close whole days (holidays) or block part of a day for one stylist or the whole shop.</p>

      <section>
        <h2 className="h-section" style={{ fontSize: 18, marginBottom: 10 }}>Closed days</h2>
        <HolidayForms />
        <section style={{ marginTop: 24 }}>
          <h3 className="h-section" style={{ fontSize: 16, marginBottom: 10 }}>Upcoming closed days</h3>
          {holidays.length === 0 ? (
            <p className="lead">No holidays yet — sync from Google or add one above.</p>
          ) : (
            <ul className="alist">
              {holidays.map((h) => (
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
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 className="h-section" style={{ fontSize: 18, marginBottom: 10 }}>Blocked times</h2>
        <BlockForm stylists={stylists} />
        <section style={{ marginTop: 24 }}>
          <h3 className="h-section" style={{ fontSize: 16, marginBottom: 10 }}>Upcoming blocks</h3>
          {blocks.length === 0 ? (
            <p className="lead">No upcoming blocks.</p>
          ) : (
            <ul className="alist">
              {blocks.map((b) => (
                <li key={b.id} className="arow arow--split">
                  <div className="arow__main">
                    <b className="arow__name">{b.stylists?.name ?? 'Whole salon'}</b>
                    <span className="arow__meta">
                      {whenFmt.format(new Date(b.starts_at))} – {whenFmt.format(new Date(b.ends_at))}
                    </span>
                    {b.reason && <span className="arow__meta">{b.reason}</span>}
                  </div>
                  <DeleteForm action={deleteBlock} id={b.id} label="Remove" />
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </div>
  );
}
