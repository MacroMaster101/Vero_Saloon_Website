'use client';
import { useActionState, useState } from 'react';
import Link from 'next/link';
import { signInWithGoogle, signInWithPassword } from './actions';
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

export function LoginForm({ next, oauthError }: { next: string; oauthError?: string | null }) {
  const [state, action] = useActionState(signInWithPassword, undefined);
  const [show, setShow] = useState(false);
  const signupHref = next ? `/signup?next=${encodeURIComponent(next)}` : '/signup';

  return (
    <div className="auth">
      <aside className="auth__panel">
        <div className="auth__orb" />
        <div className="auth__brand"><span className="pole" style={{ height: 30 }} /> Vero Salon</div>
        <div className="auth__tag"><h2>Welcome back.</h2><p>Your chair is waiting. Sign in to manage your bookings.</p></div>
      </aside>

      <div className="auth__form">
        <Link href="/" className="auth__back"><Icon name="arrowLeft" className="ic" /> Back to home</Link>
        <span className="eyebrow">Welcome back</span>
        <h1 className="h-section" style={{ fontSize: 34, margin: '12px 0 22px' }}>Sign in</h1>

        {oauthError && <p style={{ color: 'var(--error)', marginBottom: 16 }}>{oauthError}</p>}

        <form action={signInWithGoogle}>
          <input type="hidden" name="next" value={next} />
          <button className="btn btn--google btn--lg" style={{ width: '100%' }} type="submit"><GoogleMark /> Continue with Google</button>
        </form>

        <div className="divider">or sign in with email</div>

        <form action={action}>
          <input type="hidden" name="next" value={next} />
          <div className="field"><label htmlFor="login-email">Email</label><input id="login-email" name="email" type="email" required /></div>
          <div className="field">
            <label htmlFor="login-password">Password</label>
            <div className="pw">
              <input id="login-password" name="password" type={show ? 'text' : 'password'} required />
              <button type="button" className="pw__eye" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
                <Icon name={show ? 'eyeOff' : 'eye'} className="ic" size={18} />
              </button>
            </div>
          </div>
          {state?.error && <p style={{ color: 'var(--error)', margin: '0 0 12px' }}>{state.error}</p>}
          <button className="btn btn--primary btn--lg" style={{ width: '100%' }} type="submit">Sign in</button>
        </form>

        <p className="auth__alt">New here? <Link href={signupHref}>Create an account →</Link></p>
      </div>
    </div>
  );
}
