'use server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/auth';
import { isDeleteConfirmed } from '@/lib/account/guards';
import { deleteUserData } from '@/lib/account/delete';

export async function deleteMyAccount(_prev: { error: string } | undefined, formData: FormData): Promise<{ error: string } | undefined> {
  const user = await getUser();
  if (!user) return { error: 'Not signed in.' };
  if (!isDeleteConfirmed(String(formData.get('confirm') ?? ''))) {
    return { error: 'Type DELETE to confirm.' };
  }
  const result = await deleteUserData(user.id); // userId from the session, never from input
  if (!result.ok) return { error: `Deletion failed (${result.step}). Please contact the salon.` };
  const sb = await createClient();
  await sb.auth.signOut();
  redirect('/?deleted=1');
}
