import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/supabase/auth';
import { toUtcInstant } from '@/lib/time';
import { SALON_TZ, salonDayKey, splitTodayUpcoming, type BookingJoinRow } from '@/lib/booking-rows';
import { BookingsTable } from '@/components/admin/bookings-table';
import { Icon, type IconName } from '@/components/ui/icon';

// Sidebar/bottom nav already cover Bookings and My day, so the home
// shortcuts list only the management screens.
const TILES: { href: string; label: string; hint: string; icon: IconName }[] = [
  { href: '/owner/services', label: 'Prices & services', hint: 'What you offer', icon: 'scissors' },
  { href: '/owner/team', label: 'My team', hint: 'Stylists & staff accounts', icon: 'people' },
  { href: '/owner/photos', label: 'Photos', hint: 'The lookbook gallery', icon: 'grid' },
  { href: '/owner/reviews', label: 'Reviews', hint: 'What customers said', icon: 'user' },
  { href: '/owner/time-off', label: 'Days off & blocks', hint: 'Closures and blocked time', icon: 'lock' },
  { href: '/owner/hours', label: 'Opening hours', hint: 'When the shop is open', icon: 'clock' },
];

export default async function OwnerHome() {
  const profile = await requireRole(['owner', 'admin'], '/owner');
  const firstName = (profile.fullName ?? 'there').split(' ')[0];
  const sb = await createClient();

  const [{ data }, { count: serviceCount }, { count: stylistCount }] = await Promise.all([
    sb
      .from('bookings')
      .select('*, services(name), stylists(name)')
      .gte('starts_at', toUtcInstant(salonDayKey(new Date()), 0, SALON_TZ))
      .order('starts_at', { ascending: true }),
    sb.from('services').select('*', { count: 'exact', head: true }).eq('is_active', true),
    sb.from('stylists').select('*', { count: 'exact', head: true }).eq('is_active', true),
  ]);
  const { today, upcoming } = splitTodayUpcoming((data ?? []) as unknown as BookingJoinRow[]);

  return (
    <div className="apage">
      <h1 className="opage__title">Hi {firstName} 👋</h1>
      <p className="opage__hint">Here&apos;s your shop today.</p>

      <div className="ostats">
        <div className="ostat"><b>{today.length}</b><span>appointments today</span></div>
        <div className="ostat"><b>{upcoming.length}</b><span>coming up later</span></div>
        <div className="ostat"><b>{serviceCount ?? 0}</b><span>services on the menu</span></div>
        <div className="ostat"><b>{stylistCount ?? 0}</b><span>stylists working</span></div>
      </div>

      <div className="ohome">
        <section>
          <h2 className="h-section" style={{ fontSize: 20, margin: '0 0 12px' }}>Today</h2>
          {today.length === 0
            ? <p className="opage__hint">No appointments today.</p>
            : <BookingsTable bookings={today} />}

          <h2 className="h-section" style={{ fontSize: 20, margin: '28px 0 12px' }}>Coming up</h2>
          {upcoming.length === 0
            ? <p className="opage__hint">Nothing booked further ahead yet.</p>
            : <BookingsTable bookings={upcoming} />}
        </section>

        <aside className="ohome__aside">
          <h2 className="h-section" style={{ fontSize: 18, margin: 0 }}>Shortcuts</h2>
          <div className="otiles">
            {TILES.map((t) => (
              <Link key={t.href} href={t.href} className="otile">
                <Icon name={t.icon} className="ic" />
                {t.label}
                <small>{t.hint}</small>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
