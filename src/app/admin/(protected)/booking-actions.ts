'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/supabase/auth';

export type BookingStatus = 'confirmed' | 'completed' | 'no_show' | 'cancelled';

export async function setBookingStatus(id: string, status: BookingStatus): Promise<{ error: string } | { ok: true }> {
  await requireRole(['admin'], '/admin'); // defense-in-depth; RLS also enforces admin
  const sb = await createClient();
  const { error } = await sb.from('bookings').update({ status }).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin');
  return { ok: true };
}
