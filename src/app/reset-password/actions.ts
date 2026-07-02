'use server';
import { createClient } from '@/lib/supabase/server';
import { checkPassword } from '@/lib/auth/password';

export type UpdatePasswordState = { ok: true } | { error: string } | undefined;

// Sets a new password for the CURRENT session — used by both the recovery
// flow (/reset-password, session from the emailed link) and the signed-in
// "change password" section in the account Settings popup.
export async function updatePassword(_prev: UpdatePasswordState, formData: FormData): Promise<UpdatePasswordState> {
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');
  if (!checkPassword(password).passed) return { error: 'Password does not meet the requirements.' };
  if (password !== confirm) return { error: 'Passwords do not match.' };

  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { error: 'Your session has expired — request a new reset link.' };

  const { error } = await sb.auth.updateUser({ password });
  if (error) return { error: error.message };
  return { ok: true };
}
