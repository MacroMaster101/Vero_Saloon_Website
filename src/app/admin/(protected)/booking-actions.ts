'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/supabase/auth';

export type BookingStatus = 'confirmed' | 'completed' | 'no_show' | 'cancelled';

export async function setBookingStatus(id: string, status: BookingStatus): Promise<{ error: string } | { ok: true }> {
  await requireRole(['admin', 'owner'], '/admin'); // defense-in-depth; RLS also enforces admin/owner
  const sb = await createClient();
  const { error } = await sb.from('bookings').update({ status }).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin');
  return { ok: true };
}

/** Hard-delete a booking (Schedule page). Signature matches DeleteForm's action. */
export async function deleteBooking(fd: FormData): Promise<{ error: string } | { ok: true }> {
  await requireRole(['admin', 'owner'], '/admin/schedule');
  const id = String(fd.get('id') ?? '');
  if (!id) return { error: 'Missing booking' };
  const sb = await createClient(); // RLS "admin all bookings" FOR ALL permits DELETE
  const { error } = await sb.from('bookings').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/schedule');
  revalidatePath('/admin');
  return { ok: true };
}
