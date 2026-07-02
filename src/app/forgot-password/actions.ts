'use server';
import { createClient } from '@/lib/supabase/server';
import { env } from '@/lib/env';

export type ForgotState = { ok: true; email: string } | { error: string } | undefined;

// Sends the Supabase recovery email. The link lands on /auth/callback which
// exchanges the code for a session, then forwards to /reset-password.
// Always reports success so the form can't be used to probe which emails
// have accounts.
export async function requestPasswordReset(_prev: ForgotState, formData: FormData): Promise<ForgotState> {
  const email = String(formData.get('email') ?? '').trim();
  if (!email || !email.includes('@')) return { error: 'Enter the email you signed up with.' };
  const sb = await createClient();
  const redirectTo = `${env.siteUrl}/auth/callback?next=${encodeURIComponent('/reset-password')}`;
  await sb.auth.resetPasswordForEmail(email, { redirectTo });
  return { ok: true, email };
}
