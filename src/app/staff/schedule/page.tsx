import { getProfile } from '@/lib/supabase/auth';
import { getMyAssignedBookings } from '@/lib/staff/bookings';
import { getServices } from '@/lib/queries';
import { colomboDayWindow } from '@/lib/staff/view';
import { ScheduleView } from './schedule-view';

export default async function StaffSchedulePage() {
  const profile = await getProfile();
  const stylistId = profile?.stylistId ?? null;

  if (!stylistId) {
    return (
      <div className="apage">
        <div className="ahead"><div><span className="eyebrow">Roster</span><h1 className="ahead__title">My week</h1></div></div>
        <p className="step__hint">Your account isn’t linked to a stylist chair yet — contact an admin.</p>
      </div>
    );
  }

  const todayFrom = colomboDayWindow(0).from;
  const weekTo = colomboDayWindow(7).to;
  const historyFrom = colomboDayWindow(-30).from;

  const [upcoming, history, services] = await Promise.all([
    getMyAssignedBookings({ stylistId, from: todayFrom, to: weekTo }),
    getMyAssignedBookings({ stylistId, from: historyFrom, to: todayFrom }),
    getServices(),
  ]);

  return <ScheduleView initialUpcoming={upcoming} initialHistory={history} services={services as { id: string; name: string }[]} />;
}
