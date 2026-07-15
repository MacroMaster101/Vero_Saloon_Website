import { SignupForm } from './signup-form';
import { safeNext } from '@/lib/auth/redirect';
import { cookies } from 'next/headers';

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string; email?: string }> }) {
  const sp = await searchParams;
  const next = safeNext(sp.next) ?? '';
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'en';
  return <main><SignupForm next={next} prefillEmail={sp.email ?? ''} locale={locale} /></main>;
}
