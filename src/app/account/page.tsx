import { requireRole } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { getMyBookings } from '@/lib/queries';
import { ProfileForm } from './profile-form';
import { DeleteAccount } from './delete-account';
import { AccountTabs } from './account-tabs';
import { BookingsList, type AccountBooking } from './bookings-list';
import { avatarSrc } from '@/lib/avatar';

const TZ = 'Asia/Colombo';
const dateFmt = new Intl.DateTimeFormat('en-LK', { timeZone: TZ, month: 'short', year: 'numeric' });
const stampFmt = new Intl.DateTimeFormat('en-LK', { timeZone: TZ, day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });

export default async function AccountPage() {
  const profile = await requireRole(['user', 'staff', 'admin'], '/account');
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  const bookings = await getMyBookings(profile.userId, profile.email);

  const memberSince = user?.created_at ? dateFmt.format(new Date(user.created_at)) : '—';
  const lastSignIn = user?.last_sign_in_at ? stampFmt.format(new Date(user.last_sign_in_at)) : '—';
  const initial = (profile.fullName || profile.email || '?').trim().charAt(0).toUpperCase();
  const userMetadata = user?.user_metadata ?? null;
  const avatarUrl = avatarSrc(userMetadata, profile.email ?? profile.fullName); // photo or DiceBear fallback

  const bookingRows: AccountBooking[] = bookings.map((b) => ({
    id: b.id, reference: b.reference, starts_at: b.starts_at, status: b.status,
    service_id: b.service_id, stylist_id: b.stylist_id,
  }));
  const bookingsView = <BookingsList bookings={bookingRows} />;

  return (
    <AccountTabs
      name={profile.fullName ?? ''} role={profile.role} initial={initial}
      memberSince={memberSince} lastSignIn={lastSignIn} avatarUrl={avatarUrl}
      profile={
        <ProfileForm
          fullName={profile.fullName ?? ''}
          email={profile.email ?? ''}
          role={profile.role}
          userMetadata={userMetadata}
          seed={profile.email ?? profile.fullName ?? 'guest'}
        />
      }
      bookings={bookingsView}
      settings={<DeleteAccount />}
    />
  );
}
