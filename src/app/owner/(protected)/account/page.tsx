import Link from 'next/link';
import { requireRole } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { ProfileEditor } from '@/components/account/profile-editor';
import { ChangePassword } from '@/components/account/change-password';
import { Icon } from '@/components/ui/icon';

export default async function OwnerAccountPage() {
  const profile = await requireRole(['owner', 'admin'], '/owner/account');
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  const userMetadata = user?.user_metadata ?? null;
  // Same detection as the home page: an "email" identity (native signup /
  // invite) or the has_password flag stamped when a Google user set one.
  const hasPassword =
    (user?.identities ?? []).some((i) => i.provider === 'email') ||
    user?.user_metadata?.has_password === true;
  const seed = profile.email ?? profile.fullName ?? 'owner';

  return (
    <div>
      <Link href="/owner" className="oback"><Icon name="arrowLeft" className="ic" /> Home</Link>
      <h1 className="opage__title">Account</h1>
      <p className="opage__hint">Your name, photo and password — how you appear and how you sign in.</p>
      <div className="acontent-grid">
        <section className="acard">
          <div className="acard__title">Your profile</div>
          <ProfileEditor
            seed={seed}
            initialName={profile.fullName ?? ''}
            initialPhone={profile.phone ?? ''}
            userMetadata={userMetadata}
            email={profile.email}
          />
        </section>
        <section className="acard">
          <div className="acard__title">{hasPassword ? 'Change password' : 'Set a password'}</div>
          {!hasPassword && (
            <p className="step__hint" style={{ margin: '-6px 0 14px' }}>
              You signed in with Google. Add a password to also sign in with your email.
            </p>
          )}
          <ChangePassword hasPassword={hasPassword} />
        </section>
      </div>
    </div>
  );
}
