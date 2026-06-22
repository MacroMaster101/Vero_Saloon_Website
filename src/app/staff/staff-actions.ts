'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/supabase/auth';
import type { AdminBookingStatus } from '@/lib/staff/view';

export async function staffSetBookingStatus(
  id: string,
  status: AdminBookingStatus,
): Promise<{ ok: true } | { error: string }> {
  await requireRole(['staff', 'admin'], '/staff'); // gate the mutation
  const sb = await createClient(); // authenticated → RLS allows the update
  const { error } = await sb.from('bookings').update({ status }).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/staff');
  revalidatePath('/staff/schedule');
  return { ok: true };
}
