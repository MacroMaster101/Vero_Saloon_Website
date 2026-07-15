import { LoginForm } from './login-form';
import { safeNext } from '@/lib/auth/redirect';
import { cookies } from 'next/headers';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const sp = await searchParams;
  const next = safeNext(sp.next) ?? '';
  const oauthError = sp.error === 'oauth' ? 'Google sign-in failed. Please try again.' : null;
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'en';
  return <main><LoginForm next={next} oauthError={oauthError} locale={locale} /></main>;
}
