'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export type BookingStatus = 'confirmed' | 'completed' | 'no_show' | 'cancelled';

export async function setBookingStatus(id: string, status: BookingStatus): Promise<{ error: string } | { ok: true }> {
  const sb = await createClient(); // authenticated → RLS admin policy allows update
  const { error } = await sb.from('bookings').update({ status }).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin');
  return { ok: true };
}
