'use server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function signOut(): Promise<void> {
  const sb = await createClient();
  await sb.auth.signOut();
  // Shared by the public nav and the admin header — send everyone home, not to the admin login.
  redirect('/');
}
