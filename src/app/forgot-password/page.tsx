import { ForgotForm } from './forgot-form';
import { cookies } from 'next/headers';

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  const expired = sp.error === 'expired'
    ? 'That reset link has expired or was already used — request a new one below.'
    : null;
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'en';
  return <main><ForgotForm expiredNotice={expired} locale={locale} /></main>;
}
