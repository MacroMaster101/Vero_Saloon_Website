import { getProfile } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAvatarInfo } from '@/lib/avatar';
import { PublicCardForm } from './public-card-form';

export default async function StaffAccountPage() {
  const profile = await getProfile();
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  const userMetadata = user?.user_metadata ?? null;

  // Hidden shell cards are invisible to staff under RLS; service-role read is
  // scoped to the session's own stylistId (server-derived, never client input).
  const { data: stylist } = profile?.stylistId
    ? await createAdminClient().from('stylists').select('id, name, role, tags, avatar_url, slug, is_active').eq('id', profile.stylistId).single()
    : { data: null };

  const seed = profile?.email ?? profile?.fullName ?? 'staff';
  const avatar = getAvatarInfo(userMetadata, seed).src;

  return (
    <div className="apage">
      <div className="ahead">
        <div><span className="eyebrow">Profile</span><h1 className="ahead__title">Account</h1></div>
        <span className="role-badge">Staff</span>
      </div>

      <p className="step__hint" style={{ marginTop: -10 }}>
        Chair: <b>{stylist?.name ?? 'Not linked'}</b>
        {stylist
          ? ' — edit your name and photo from the profile menu at the top of the site.'
          : ' — ask an admin to connect your login to your stylist profile.'}
      </p>

      {stylist && (
        <PublicCardForm
          displayName={profile?.fullName ?? stylist.name}
          avatarUrl={avatar}
          initialRole={stylist.role}
          initialTags={stylist.tags ?? []}
          initialActive={stylist.is_active}
        />
      )}
    </div>
  );
}
