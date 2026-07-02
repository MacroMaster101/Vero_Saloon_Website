'use client';
import { useActionState } from 'react';
import Link from 'next/link';
import { requestPasswordReset } from './actions';
import { AuthShell } from '@/components/auth/auth-shell';

export function ForgotForm({ expiredNotice }: { expiredNotice?: string | null }) {
  const [state, action] = useActionState(requestPasswordReset, undefined);

  if (state && 'ok' in state) {
    return (
      <AuthShell back={{ href: '/login', label: 'Back to sign in' }}>
          <span className="eyebrow">Check your email</span>
          <h1 className="h-section auth__title">Reset link <em>sent</em></h1>
          <p className="auth__lead">
            If an account exists for <b>{state.email}</b>, we&apos;ve emailed a link to reset the password.
            The link is valid for a short time — check spam if it doesn&apos;t arrive.
          </p>
          <p className="auth__alt" style={{ textAlign: 'left' }}><Link href="/login">← Back to sign in</Link></p>
      </AuthShell>
    );
  }

  return (
    <AuthShell back={{ href: '/login', label: 'Back to sign in' }}>
        <span className="eyebrow">Reset password</span>
        <h1 className="h-section auth__title">Forgot your <em>password?</em></h1>
        <p className="auth__lead">It happens. We&apos;ll email you a link to set a new one.</p>

        {expiredNotice && <p style={{ color: 'var(--error)', marginBottom: 16 }}>{expiredNotice}</p>}

        <form action={action}>
          <div className="field"><label htmlFor="fp-email">Email</label><input id="fp-email" name="email" type="email" placeholder="verosalon@gmail.com" autoComplete="email" required /></div>
          {state?.error && <p style={{ color: 'var(--error)', margin: '0 0 12px' }}>{state.error}</p>}
          <button className="btn btn--primary btn--lg" style={{ width: '100%' }} type="submit">Email me a reset link</button>
        </form>

        <p className="auth__alt">Remembered it? <Link href="/login">Sign in →</Link></p>
    </AuthShell>
  );
}
