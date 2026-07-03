import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/supabase/auth';
import { toUtcInstant } from '@/lib/time';
import { SALON_TZ, salonDayKey, splitTodayUpcoming, type BookingJoinRow } from '@/lib/booking-rows';
import { BookingsTable } from '@/components/admin/bookings-table';
import { StatTiles, type StatTile } from '@/components/admin/stat-tiles';

export default async function AdminHome() {
  await requireRole(['admin'], '/admin');
  const sb = await createClient();
  // Only today's and future bookings are shown, so filter in the query instead
  // of fetching the whole history and discarding the past rows here.
  const { data, error } = await sb
    .from('bookings')
    .select('*, services(name), stylists(name)')
    .gte('starts_at', toUtcInstant(salonDayKey(new Date()), 0, SALON_TZ))
    .order('starts_at', { ascending: true });

  const rows = (data ?? []) as unknown as BookingJoinRow[];

  const [{ count: serviceCount }, { count: bookableCount }, { count: stylistCount }] = await Promise.all([
    sb.from('services').select('*', { count: 'exact', head: true }),
    sb.from('services').select('*', { count: 'exact', head: true }).eq('bookable', true),
    sb.from('stylists').select('*', { count: 'exact', head: true }).eq('is_active', true),
  ]);

  // Group by salon-local calendar date. Past bookings are excluded (Today + Upcoming only).
  const { today, upcoming } = splitTodayUpcoming(rows);

  const tiles: StatTile[] = [
    { k: 'Today', n: String(today.length), sub: 'bookings' },
    { k: 'Upcoming', n: String(upcoming.length), sub: 'scheduled' },
    { k: 'Services', n: String(serviceCount ?? 0), sub: `${bookableCount ?? 0} bookable` },
    { k: 'Stylists', n: String(stylistCount ?? 0), sub: 'active' },
  ];

  return (
    <div className="apage">
      <div className="ahead">
        <div><span className="eyebrow">Overview</span><h1 className="ahead__title">Dashboard</h1></div>
        <Link href="/admin/blocked-slots" className="btn btn--ghost">Blocked slots</Link>
      </div>
      <StatTiles tiles={tiles} />

      {error && (
        <p className="lead" style={{ marginTop: 12, color: 'var(--accent)' }}>
          Could not load bookings: {error.message}
        </p>
      )}

      {!error && today.length === 0 && upcoming.length === 0 && (
        <div className="aempty"><p className="lead">No bookings yet.</p></div>
      )}

      {!error && (today.length > 0 || upcoming.length > 0) && (
        <>
          <section style={{ marginTop: 28 }}>
            <h2 className="h-section" style={{ fontSize: 20, marginBottom: 12 }}>Today</h2>
            <BookingsTable bookings={today} />
          </section>

          <section style={{ marginTop: 36 }}>
            <h2 className="h-section" style={{ fontSize: 20, marginBottom: 12 }}>Upcoming</h2>
            <BookingsTable bookings={upcoming} />
          </section>
        </>
      )}
    </div>
  );
}
