import { getProfile } from '@/lib/supabase/auth';
import { getMyAssignedBookings } from '@/lib/staff/bookings';
import { getServices } from '@/lib/queries';
import { colomboDayWindow } from '@/lib/staff/view';
import { cardNeedsSetup } from '@/lib/staff/card-input';
import { createAdminClient } from '@/lib/supabase/admin';
import { TodayView } from './today-view';

const TZ = 'Asia/Colombo';
const dayTitleFmt = new Intl.DateTimeFormat('en-LK', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'short' });

export default async function StaffTodayPage() {
  const profile = await getProfile();
  const stylistId = profile?.stylistId ?? null;

  if (!stylistId) {
    return (
      <div className="apage">
        <div className="ahead"><div><span className="eyebrow">Staff Desk</span><h1 className="ahead__title">Today</h1></div></div>
        <p className="step__hint">Your account isn’t linked to a stylist chair yet — contact an admin.</p>
      </div>
    );
  }

  const { from, to } = colomboDayWindow(0);
  // Hidden shell cards are invisible to staff under RLS; service-role read is
  // scoped to the session's own stylistId (server-derived, never client input).
  const admin = createAdminClient();
  const [bookings, services, { data: card }] = await Promise.all([
    getMyAssignedBookings({ stylistId, from, to }),
    getServices(),
    admin.from('stylists').select('role, is_active').eq('id', stylistId).single(),
  ]);
  const showSetup = card ? cardNeedsSetup(card) : false;

  return (
    <TodayView
      initialBookings={bookings}
      services={services as { id: string; name: string }[]}
      dayTitle={dayTitleFmt.format(new Date())}
      showSetup={showSetup}
    />
  );
}
