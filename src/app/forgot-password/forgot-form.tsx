'use client';
import { useActionState } from 'react';
import Link from 'next/link';
import { requestPasswordReset } from './actions';
import { AuthShell } from '@/components/auth/auth-shell';
import { t } from '@/lib/i18n/translations';

export function ForgotForm({ expiredNotice, locale = 'en' }: { expiredNotice?: string | null; locale?: string }) {
  const [state, action] = useActionState(requestPasswordReset, undefined);

  if (state && 'ok' in state) {
    return (
      <AuthShell back={{ href: '/login', label: t('Back to sign in', locale) }} locale={locale}>
          <span className="eyebrow">{t('Check your email', locale)}</span>
          <h1 className="h-section auth__title">{t('Reset link', locale)} <em>{t('sent', locale)}</em></h1>
          <p className="auth__lead">
            {t('If an account exists for', locale)} <b>{state.email}</b>, {t("we've emailed a reset link. Check spam if it doesn't arrive.", locale)}
          </p>
          <p className="auth__alt" style={{ textAlign: 'left' }}><Link href="/login">← {t('Back to sign in', locale)}</Link></p>
      </AuthShell>
    );
  }

  return (
    <AuthShell back={{ href: '/login', label: t('Back to sign in', locale) }} locale={locale}>
        <span className="eyebrow">{t('Reset password', locale)}</span>
        <h1 className="h-section auth__title">{t('Forgot your', locale)} <em>{t('password?', locale)}</em></h1>
        <p className="auth__lead">{t("It happens. We'll email you a link to set a new one.", locale)}</p>

        {expiredNotice && <p style={{ color: 'var(--error)', marginBottom: 16 }}>{expiredNotice}</p>}

        <form action={action}>
          <div className="field"><label htmlFor="fp-email">{t('Email', locale)}</label><input id="fp-email" name="email" type="email" placeholder="verosalon@gmail.com" autoComplete="email" required /></div>
          {state?.error && <p style={{ color: 'var(--error)', margin: '0 0 12px' }}>{state.error}</p>}
          <button className="btn btn--primary btn--lg" style={{ width: '100%' }} type="submit">{t('Email me a reset link', locale)}</button>
        </form>

        <p className="auth__alt">{t('Remembered it?', locale)} <Link href="/login">{t('Sign in →', locale)}</Link></p>
    </AuthShell>
  );
}
