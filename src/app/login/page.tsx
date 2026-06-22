import { LoginForm } from './login-form';
import { safeNext } from '@/lib/auth/redirect';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const sp = await searchParams;
  const next = safeNext(sp.next) ?? '';
  const oauthError = sp.error === 'oauth' ? 'Google sign-in failed. Please try again.' : null;
  return <main><LoginForm next={next} oauthError={oauthError} /></main>;
}
