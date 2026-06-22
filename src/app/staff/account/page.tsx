import { getProfile } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { getStylists } from '@/lib/queries';
import { ProfileForm } from '@/app/account/profile-form';
import { signOut } from '@/app/admin/actions';
import { Icon } from '@/components/ui/icon';

export default async function StaffAccountPage() {
  const profile = await getProfile();
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  const userMetadata = user?.user_metadata ?? null;

  const stylists = (await getStylists()) as { id: string; name: string }[];
  const stylistName = profile?.stylistId
    ? stylists.find((s) => s.id === profile.stylistId)?.name ?? '—'
    : 'Not linked';

  return (
    <div className="apage">
      <div className="ahead">
        <div><span className="eyebrow">Profile</span><h1 className="ahead__title">Account</h1></div>
        <span className="role-badge">Staff</span>
      </div>

      <p className="step__hint" style={{ marginTop: -10 }}>Chair: <b>{stylistName}</b></p>

      <ProfileForm
        fullName={profile?.fullName ?? ''}
        email={profile?.email ?? ''}
        role={profile?.role ?? 'staff'}
        userMetadata={userMetadata}
        seed={profile?.email ?? profile?.fullName ?? 'staff'}
      />

      <div style={{ marginTop: 28 }}>
        <form action={signOut}>
          <button className="btn btn--ghost" type="submit"><Icon name="logout" className="ic" /> Sign out</button>
        </form>
      </div>
    </div>
  );
}
