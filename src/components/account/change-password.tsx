'use client';
import { useActionState, useState } from 'react';
import { updatePassword } from '@/app/reset-password/actions';
import { checkPassword } from '@/lib/auth/password';

// Signed-in password change for the Settings popup. Reuses the recovery
// flow's updatePassword action — both just set a new password on the session.
// Google-only users can use it too: setting a password enables email sign-in.
export function ChangePassword() {
  const [state, action] = useActionState(updatePassword, undefined);
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');

  const check = checkPassword(pw);
  const barColor = check.score <= 2 ? 'var(--error)' : check.score <= 4 ? 'var(--accent)' : 'var(--success)';
  const matches = confirm.length > 0 && pw === confirm;

  return (
    <form action={action} style={{ marginBottom: 18 }}>
      <label className="pm__field">
        <span>New password</span>
        <input name="password" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} />
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
        <input name="confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </label>
      {confirm.length > 0 && (
        <p className={`match ${matches ? 'ok' : 'bad'}`} style={{ margin: '-6px 0 12px' }}>
          {matches ? '✓ Passwords match' : '✗ Passwords don’t match'}
        </p>
      )}

      {state && 'error' in state && <p className="astatus astatus--err">{state.error}</p>}
      {state && 'ok' in state && <p className="astatus astatus--ok">Password updated.</p>}

      <button className="btn btn--primary" type="submit" disabled={!check.passed || !matches}>
        Update password
      </button>
    </form>
  );
}
