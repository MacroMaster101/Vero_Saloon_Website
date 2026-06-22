import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getStylists } from '@/lib/queries';
import type { BlockedSlot } from '@/lib/supabase/types';
import { BlockForm } from '@/components/admin/block-form';
import { deleteBlock } from './block-actions';

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

type Row = BlockedSlot & { stylists: { name: string } | null };

export default async function BlockedSlotsPage() {
  const sb = await createClient();
  const [{ data }, stylists] = await Promise.all([
    sb
      .from('blocked_slots')
      .select('*, stylists(name)')
      .gt('ends_at', new Date().toISOString())
      .order('starts_at'),
    getStylists(),
  ]);
  const rows = (data ?? []) as unknown as Row[];

  return (
    <div className="apage">
      <div className="ahead">
        <h1 className="ahead__title">Blocked slots</h1>
        <Link href="/admin" className="btn btn--ghost">Back to dashboard</Link>
      </div>
      <p className="lead" style={{ marginTop: 12 }}>
        Block off time for a stylist or the whole salon. Booking availability hides these times.
      </p>

      <BlockForm stylists={stylists} />

      <section style={{ marginTop: 40 }}>
        <h2 className="h-section" style={{ fontSize: 20, marginBottom: 12 }}>Upcoming blocks</h2>
        {rows.length === 0 ? (
          <p className="lead">No upcoming blocks.</p>
        ) : (
          <ul className="alist">
            {rows.map((b) => (
              <li key={b.id} className="arow arow--split">
                <div className="arow__main">
                  <b className="arow__name">{b.stylists?.name ?? 'Whole salon'}</b>
                  <span className="arow__meta">
                    {whenFmt.format(new Date(b.starts_at))} – {whenFmt.format(new Date(b.ends_at))}
                  </span>
                  {b.reason && <span className="arow__meta">{b.reason}</span>}
                </div>
                <form action={deleteBlock}>
                  <input type="hidden" name="id" value={b.id} />
                  <button type="submit" className="btn btn--danger-outline">Remove</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
