import { requireRole } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { ProfileEditor } from '@/components/account/profile-editor';
import { ChangePassword } from '@/components/account/change-password';

export default async function AdminAccountPage() {
  const profile = await requireRole(['admin'], '/admin/account');
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  const userMetadata = user?.user_metadata ?? null;
  // Same detection as the home page: an "email" identity (native signup /
  // invite) or the has_password flag stamped when a Google user set one.
  const hasPassword =
    (user?.identities ?? []).some((i) => i.provider === 'email') ||
    user?.user_metadata?.has_password === true;
  const seed = profile.email ?? profile.fullName ?? 'admin';

  return (
    <div className="apage">
      <div className="ahead">
        <div>
          <span className="eyebrow">You</span>
          <h1 className="ahead__title">Account</h1>
        </div>
      </div>
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
