'use server';
import { createClient } from '@/lib/supabase/server';
import { safeNext } from '@/lib/auth/redirect';
import { env } from '@/lib/env';
import { checkPassword } from '@/lib/auth/password';

export type SignUpState = { error: string } | { ok: true; email: string } | undefined;

export async function signUpWithPassword(_prev: SignUpState, formData: FormData): Promise<SignUpState> {
  const fullName = String(formData.get('full_name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');
  const next = safeNext(String(formData.get('next') ?? ''));

  if (fullName.length < 2) return { error: 'Please enter your full name.' };
  if (!checkPassword(password).passed) return { error: 'Password does not meet the requirements.' };
  if (password !== confirm) return { error: 'Passwords do not match.' };

  const sb = await createClient();
  const emailRedirectTo = `${env.siteUrl}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ''}`;
  const { error } = await sb.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName }, emailRedirectTo },
  });
  if (error) return { error: error.message };
  return { ok: true, email };
}
