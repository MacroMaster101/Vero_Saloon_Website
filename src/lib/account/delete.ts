import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

export type DeleteResult =
  | { ok: true }
  | { ok: false; step: 'anonymize' | 'profile' | 'auth'; message: string };

// Anonymize the user's bookings, delete their profile, then delete the auth user.
// Order matters: the irreversible auth delete is LAST so a failure leaves no PII behind.
export async function deleteUserData(userId: string): Promise<DeleteResult> {
  const admin = createAdminClient();
  const a = await admin.rpc('anonymize_user_bookings', { target: userId });
  if (a.error) return { ok: false, step: 'anonymize', message: a.error.message };
  const p = await admin.from('profiles').delete().eq('id', userId);
  if (p.error) return { ok: false, step: 'profile', message: p.error.message };
  const d = await admin.auth.admin.deleteUser(userId);
  if (d.error) return { ok: false, step: 'auth', message: d.error.message };
  return { ok: true };
}
