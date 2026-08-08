import Link from 'next/link';
import { requireRole } from '@/lib/supabase/auth';
import { getMyAssignedBookings } from '@/lib/staff/bookings';
import { getServices } from '@/lib/queries';
import { colomboDayWindow, groupByDay, serviceLabel, type StaffBooking } from '@/lib/staff/view';
import { Icon } from '@/components/ui/icon';

const TZ = 'Asia/Colombo';
const timeFmt = new Intl.DateTimeFormat('en-LK', { timeZone: TZ, hour: 'numeric', minute: '2-digit', hour12: true });
const dayTitleFmt = new Intl.DateTimeFormat('en-LK', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' });

const TAG_CLASS: Record<string, string> = {
  confirmed: 'tag--confirmed', completed: 'tag--completed', no_show: 'tag--no_show', cancelled: 'tag--cancelled',
};
const TAG_LABEL: Record<string, string> = {
  confirmed: 'Confirmed', completed: 'Completed', no_show: 'No-show', cancelled: 'Cancelled',
};

function AppointmentCard({ b, services }: { b: StaffBooking; services: { id: string; name: string }[] }) {
  return (
    <li className="oday__card">
      <span className="oday__time">{timeFmt.format(new Date(b.starts_at))}</span>
      <span className="oday__who">
        <b>{b.customer_name}</b>
        <span>{serviceLabel(services, b.service_id)} · {b.customer_phone}</span>
      </span>
      <span className={`tag ${TAG_CLASS[b.status] ?? ''}`}>{TAG_LABEL[b.status] ?? b.status}</span>
    </li>
  );
}

export default async function OwnerMyDayPage() {
  const profile = await requireRole(['owner', 'admin'], '/owner/my-day');
  const stylistId = profile.stylistId;

  if (!stylistId) {
    return (
      <div>
        <Link href="/owner" className="oback"><Icon name="arrowLeft" className="ic" /> Home</Link>
        <h1 className="opage__title">My day</h1>
        <p className="opage__hint">
          Your account isn&apos;t linked to your stylist profile yet, so there&apos;s no chair to show.
          Ask your admin to link it — an owner can&apos;t set this on their own account
          (canSetRole and the profiles_protect_privileges trigger both block it).
        </p>
      </div>
    );
  }

  const today = colomboDayWindow(0);
  const weekEnd = colomboDayWindow(7);
  const [todays, upcoming, services] = await Promise.all([
    getMyAssignedBookings({ stylistId, from: today.from, to: today.to }),
    getMyAssignedBookings({ stylistId, from: today.to, to: weekEnd.to }),
    getServices(),
  ]);
  const svc = services as { id: string; name: string }[];
  const week = groupByDay(upcoming);

  return (
    <div>
      <Link href="/owner" className="oback"><Icon name="arrowLeft" className="ic" /> Home</Link>
      <h1 className="opage__title">My day</h1>
      <p className="opage__hint">{dayTitleFmt.format(new Date())} — your own appointments, not the whole shop&apos;s.</p>

      {todays.length === 0
        ? <p className="opage__hint">No appointments for you today.</p>
        : <ul className="oday">{todays.map((b) => <AppointmentCard key={b.id} b={b} services={svc} />)}</ul>}

      <section style={{ marginTop: 30 }}>
        <h2 className="h-section" style={{ fontSize: 20, marginBottom: 6 }}>Coming up this week</h2>
        {week.length === 0
          ? <p className="opage__hint">Nothing booked for you in the next 7 days.</p>
          : week.map((day) => (
              <div key={day.dayKey} style={{ marginTop: 14 }}>
                <p className="opage__hint" style={{ margin: '0 0 4px', fontWeight: 600 }}>{day.dayLabel}</p>
                <ul className="oday">{day.items.map((b) => <AppointmentCard key={b.id} b={b} services={svc} />)}</ul>
              </div>
            ))}
      </section>
    </div>
  );
}
