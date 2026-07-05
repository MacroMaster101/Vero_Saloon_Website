'use client';
import { useActionState, useEffect, useState } from 'react';
import { updatePassword } from '@/app/reset-password/actions';
import { checkPassword } from '@/lib/auth/password';
import { Icon } from '@/components/ui/icon';
import { PasswordInput } from '@/components/auth/password-input';

// Signed-in password change for the Settings popup. Reuses the recovery
// flow's updatePassword action — both just set a new password on the session.
// Google-only users can use it too: setting a password enables email sign-in.
export function ChangePassword({ hasPassword = true, onPasswordSet }: { hasPassword?: boolean; onPasswordSet?: () => void }) {
  const [state, action] = useActionState(updatePassword, undefined);
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');

  const check = checkPassword(pw);
  const barColor = check.score <= 2 ? 'var(--error)' : check.score <= 4 ? 'var(--accent)' : 'var(--success)';
  const matches = confirm.length > 0 && pw === confirm;
  const done = state && 'ok' in state;
  // Freeze whether this was a first-time "set" vs a "change" at mount, so the
  // parent flipping its flag on success doesn't relabel the success card.
  const [wasSet] = useState(!hasPassword);

  // Tell the parent once, so a Google user who just set a password is treated
  // as a password user for the rest of the session (no refresh needed).
  useEffect(() => {
    if (done) onPasswordSet?.();
  }, [done, onPasswordSet]);

  if (done) {
    return (
      <div className="pw-done" role="status">
        <span className="pw-done__badge"><Icon name="check" className="ic" size={22} /></span>
        <h4>{wasSet ? 'Password set' : 'Password updated'}</h4>
        <p>
          {wasSet
            ? 'You can now sign in with your email and this password — and Google still works too.'
            : 'Your new password is ready to use next time you sign in.'}
        </p>
      </div>
    );
  }

  return (
    <form action={action} style={{ marginBottom: 18 }}>
      <label className="pm__field">
        <span>New password</span>
        <PasswordInput name="password" autoComplete="new-password" value={pw} onChange={setPw} />
      </label>
      {pw.length > 0 && (
        <div style={{ margin: '-6px 0 12px' }}>
          <div className="meter"><i style={{ width: `${(check.score / 5) * 100}%`, background: barColor }} /></div>
          <ul className="reqs">
            {check.results.map((r) => (
              <li key={r.id} className={r.met ? 'met' : ''}><span className="dot">{r.met ? '✓' : ''}</span> {r.label}</li>
            ))}
          </ul>
        </div>
      )}
      <label className="pm__field">
        <span>Confirm new password</span>
        <PasswordInput name="confirm" autoComplete="new-password" value={confirm} onChange={setConfirm} />
      </label>
      {confirm.length > 0 && (
        <p className={`match ${matches ? 'ok' : 'bad'}`} style={{ margin: '-6px 0 12px' }}>
          {matches ? '✓ Passwords match' : '✗ Passwords don’t match'}
        </p>
      )}

      {state && 'error' in state && <p className="astatus astatus--err">{state.error}</p>}

      <button className="btn btn--primary" type="submit" disabled={!check.passed || !matches}>
        {hasPassword ? 'Update password' : 'Set password'}
      </button>
    </form>
  );
}
