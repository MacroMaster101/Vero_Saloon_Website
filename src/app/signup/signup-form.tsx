'use client';
import { useActionState, useState } from 'react';
import Link from 'next/link';
import { signInWithGoogle } from '../login/actions';
import { signUpWithPassword } from './actions';
import { checkPassword } from '@/lib/auth/password';
import { Icon } from '@/components/ui/icon';

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" style={{ flex: 'none' }} aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.6l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.3 5.3C41.8 35.9 44 30.5 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}

export function SignupForm({ next }: { next: string }) {
  const [state, action] = useActionState(signUpWithPassword, undefined);
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : '/login';

  const check = checkPassword(pw);
  const barColor = check.score <= 2 ? 'var(--error)' : check.score <= 4 ? 'var(--accent)' : 'var(--success)';
  const matches = confirm.length > 0 && pw === confirm;

  if (state && 'ok' in state) {
    return (
      <div className="auth">
        <aside className="auth__panel">
          <div className="auth__orb" />
          <div className="auth__brand"><span className="pole" style={{ height: 30 }} /> Vero Salon</div>
          <div className="auth__tag"><h2>Almost there.</h2><p>We just need to confirm it&apos;s you.</p></div>
        </aside>
        <div className="auth__form">
          <span className="eyebrow">Check your email</span>
          <h1 className="h-section" style={{ fontSize: 30, margin: '12px 0 14px' }}>Confirm your account</h1>
          <p className="lead">We sent a confirmation link to <b>{state.email}</b>. Click it to activate your account, then sign in.</p>
          <p className="auth__alt" style={{ textAlign: 'left', marginTop: 24 }}><Link href={loginHref}>← Back to sign in</Link></p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth">
      <aside className="auth__panel">
        <div className="auth__orb" />
        <div className="auth__brand"><span className="pole" style={{ height: 30 }} /> Vero Salon</div>
        <div className="auth__tag"><h2>Join Vero.</h2><p>Create an account to book faster and track your visits.</p></div>
      </aside>

      <div className="auth__form">
        <Link href="/" className="auth__back"><Icon name="arrowLeft" className="ic" /> Back to home</Link>
        <span className="eyebrow">Get started</span>
        <h1 className="h-section" style={{ fontSize: 32, margin: '12px 0 20px' }}>Create account</h1>

        <form action={signInWithGoogle}>
          <input type="hidden" name="next" value={next} />
          <button className="btn btn--google btn--lg" style={{ width: '100%' }} type="submit"><GoogleMark /> Continue with Google</button>
        </form>

        <div className="divider">or with email</div>

        <form action={action}>
          <input type="hidden" name="next" value={next} />
          <div className="field"><label htmlFor="su-name">Full name</label><input id="su-name" name="full_name" required /></div>
          <div className="field"><label htmlFor="su-email">Email</label><input id="su-email" name="email" type="email" required /></div>

          <div className="field">
            <label htmlFor="su-pw">Password</label>
            <div className="pw">
              <input id="su-pw" name="password" type={showPw ? 'text' : 'password'} required value={pw} onChange={(e) => setPw(e.target.value)} />
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
            <label htmlFor="su-cf">Confirm password</label>
            <div className="pw">
              <input id="su-cf" name="confirm" type={showCf ? 'text' : 'password'} required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              <button type="button" className="pw__eye" onClick={() => setShowCf((s) => !s)} aria-label={showCf ? 'Hide password' : 'Show password'}>
                <Icon name={showCf ? 'eyeOff' : 'eye'} className="ic" size={18} />
              </button>
            </div>
            {confirm.length > 0 && (
              <p className={`match ${matches ? 'ok' : 'bad'}`}>{matches ? '✓ Passwords match' : '✗ Passwords don’t match'}</p>
            )}
          </div>

          {state?.error && <p style={{ color: 'var(--error)', margin: '0 0 12px' }}>{state.error}</p>}
          <button className="btn btn--primary btn--lg" style={{ width: '100%' }} type="submit" disabled={!check.passed || !matches}>Create account</button>
        </form>

        <p className="auth__alt">Already have an account? <Link href={loginHref}>Sign in →</Link></p>
      </div>
    </div>
  );
}
