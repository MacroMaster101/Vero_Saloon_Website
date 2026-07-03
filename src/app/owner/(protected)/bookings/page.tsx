import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/supabase/auth';
import { toUtcInstant } from '@/lib/time';
import { SALON_TZ, salonDayKey, splitTodayUpcoming, type BookingJoinRow } from '@/lib/booking-rows';
import { BookingsTable } from '@/components/admin/bookings-table';
import { Icon } from '@/components/ui/icon';

export default async function OwnerBookingsPage() {
  await requireRole(['owner', 'admin'], '/owner/bookings');
  const sb = await createClient();
  const { data, error } = await sb
    .from('bookings')
    .select('*, services(name), stylists(name)')
    .gte('starts_at', toUtcInstant(salonDayKey(new Date()), 0, SALON_TZ))
    .order('starts_at', { ascending: true });
  const { today, upcoming } = splitTodayUpcoming((data ?? []) as unknown as BookingJoinRow[]);

  return (
    <div>
      <Link href="/owner" className="oback"><Icon name="arrowLeft" className="ic" /> Home</Link>
      <h1 className="opage__title">Bookings</h1>
      <p className="opage__hint">Tap a booking&apos;s buttons to mark it done, a no-show, or cancelled.</p>
      {error && <p className="astatus astatus--err">Could not load bookings: {error.message}</p>}
      {!error && today.length === 0 && upcoming.length === 0 && <p className="opage__hint">No bookings yet.</p>}
      {today.length > 0 && (
        <section style={{ marginTop: 8 }}>
          <h2 className="h-section" style={{ fontSize: 18, marginBottom: 10 }}>Today</h2>
          <BookingsTable bookings={today} />
        </section>
      )}
      {upcoming.length > 0 && (
        <section style={{ marginTop: 24 }}>
          <h2 className="h-section" style={{ fontSize: 18, marginBottom: 10 }}>Coming up</h2>
          <BookingsTable bookings={upcoming} />
        </section>
      )}
    </div>
  );
}
