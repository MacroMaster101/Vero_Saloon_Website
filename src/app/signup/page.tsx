import { SignupForm } from './signup-form';
import { safeNext } from '@/lib/auth/redirect';

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string; email?: string }> }) {
  const sp = await searchParams;
  const next = safeNext(sp.next) ?? '';
  // Prefill the email when arriving from the booking confirmation, so a guest
  // can claim their booking in one tap. Validated again on submit.
  const email = typeof sp.email === 'string' ? sp.email.slice(0, 254) : '';
  return <main><SignupForm next={next} prefillEmail={email} /></main>;
}
