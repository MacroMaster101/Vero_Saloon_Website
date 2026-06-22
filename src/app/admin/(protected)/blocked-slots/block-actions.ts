'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { toUtcInstant } from '@/lib/time';

const TZ = 'Asia/Colombo';

export async function createBlock(formData: FormData): Promise<{ error: string } | { ok: true }> {
  const sb = await createClient();
  const date = String(formData.get('date') ?? '');
  const startMin = Number(formData.get('startMin'));
  const endMin = Number(formData.get('endMin'));
  const stylistRaw = String(formData.get('stylistId') ?? 'all');
  const reason = String(formData.get('reason') ?? '');

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: 'Pick a valid date.' };
  if (!Number.isFinite(startMin) || !Number.isFinite(endMin) || endMin <= startMin) {
    return { error: 'End time must be after start time.' };
  }
  const { error } = await sb.from('blocked_slots').insert({
    stylist_id: stylistRaw === 'all' ? null : stylistRaw,
    starts_at: toUtcInstant(date, startMin, TZ),
    ends_at: toUtcInstant(date, endMin, TZ),
    reason,
  });
  if (error) return { error: error.message };
  revalidatePath('/admin/blocked-slots');
  revalidatePath('/admin');
  return { ok: true };
}

export async function deleteBlock(formData: FormData): Promise<void> {
  const sb = await createClient();
  const id = String(formData.get('id') ?? '');
  if (id) await sb.from('blocked_slots').delete().eq('id', id);
  revalidatePath('/admin/blocked-slots');
}
