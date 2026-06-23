'use server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { safeNext } from '@/lib/auth/redirect';
import { env } from '@/lib/env';
import { routeForSession } from '@/lib/auth/routing';
import { getProfile } from '@/lib/supabase/auth';

export async function signInWithGoogle(formData: FormData): Promise<void> {
  const next = safeNext(String(formData.get('next') ?? '')) ?? '';
  const sb = await createClient();
  const redirectTo = `${env.siteUrl}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ''}`;
  const { data, error } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
  if (error || !data?.url) redirect('/login?error=oauth');
  redirect(data.url);
}

export async function signInWithPassword(_prev: unknown, formData: FormData): Promise<{ error: string } | undefined> {
  const sb = await createClient();
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const explicitNext = safeNext(String(formData.get('next') ?? ''));
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  const profile = await getProfile();
  redirect(routeForSession(profile?.role ?? null, profile?.stylistId ?? null, false, explicitNext));
}
