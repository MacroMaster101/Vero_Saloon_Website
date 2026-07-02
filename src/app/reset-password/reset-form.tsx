'use client';
import { useActionState, useState } from 'react';
import Link from 'next/link';
import { updatePassword } from './actions';
import { checkPassword } from '@/lib/auth/password';
import { AuthShell } from '@/components/auth/auth-shell';
import { Icon } from '@/components/ui/icon';

export function ResetForm({ email }: { email: string }) {
  const [state, action] = useActionState(updatePassword, undefined);
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);

  const check = checkPassword(pw);
  const barColor = check.score <= 2 ? 'var(--error)' : check.score <= 4 ? 'var(--accent)' : 'var(--success)';
  const matches = confirm.length > 0 && pw === confirm;

  if (state && 'ok' in state) {
    return (
      <AuthShell back={{ href: '/', label: 'Back to home' }}>
          <span className="eyebrow">Done</span>
          <h1 className="h-section auth__title">Password <em>updated</em></h1>
          <p className="auth__lead">You&apos;re signed in and your new password is active from now on.</p>
          <p className="auth__alt" style={{ textAlign: 'left' }}><Link href="/">← Back to home</Link></p>
      </AuthShell>
    );
  }

  return (
    <AuthShell back={{ href: '/', label: 'Back to home' }}>
        <span className="eyebrow">Reset password</span>
        <h1 className="h-section auth__title">Choose a new <em>password</em></h1>
        {email && <p className="auth__lead">for <b>{email}</b></p>}

        <form action={action}>
          <div className="field">
            <label htmlFor="rp-pw">New password</label>
            <div className="pw">
              <input id="rp-pw" name="password" type={showPw ? 'text' : 'password'} placeholder="••••••••" required value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" />
              <button type="button" className="pw__eye" onClick={() => setShowPw((s) => !s)} aria-label={showPw ? 'Hide password' : 'Show password'}>
                <Icon name={showPw ? 'eyeOff' : 'eye'} className="ic" size={18} />
              </button>
            </div>
            <div className={`pwmeta${pw ? ' show' : ''}`}>
              <div>
                <div className="meter"><i style={{ width: `${(check.score / 5) * 100}%`, background: barColor }} /></div>
                <ul className="reqs">
                  {check.results.map((r) => (
                    <li key={r.id} className={r.met ? 'met' : ''}><span className="dot">{r.met ? '✓' : ''}</span> {r.label}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="field">
            <label htmlFor="rp-cf">Confirm password</label>
            <div className="pw">
              <input id="rp-cf" name="confirm" type={showCf ? 'text' : 'password'} placeholder="••••••••" required value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
              <button type="button" className="pw__eye" onClick={() => setShowCf((s) => !s)} aria-label={showCf ? 'Hide password' : 'Show password'}>
                <Icon name={showCf ? 'eyeOff' : 'eye'} className="ic" size={18} />
              </button>
            </div>
            {confirm.length > 0 && (
              <p className={`match ${matches ? 'ok' : 'bad'}`}>{matches ? '✓ Passwords match' : '✗ Passwords don’t match'}</p>
            )}
          </div>

          {state?.error && <p style={{ color: 'var(--error)', margin: '0 0 12px' }}>{state.error}</p>}
          <button className="btn btn--primary btn--lg" style={{ width: '100%' }} type="submit" disabled={!check.passed || !matches}>Set new password</button>
        </form>
    </AuthShell>
  );
}
