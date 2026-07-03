'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/supabase/auth';
import { getUser } from '@/lib/supabase/auth';
import { canAdminDelete } from '@/lib/account/guards';
import { deleteUserData } from '@/lib/account/delete';
import { canSetRole } from '@/lib/auth/role-rules';
import type { Role } from '@/lib/auth/roles';

type Result = { ok: true } | { error: string };

export async function setRole(formData: FormData): Promise<Result> {
  const actor = await requireRole(['admin', 'owner'], '/admin/people');
  const id = String(formData.get('id') ?? '');
  const role = String(formData.get('role') ?? 'user');
  const stylistRaw = String(formData.get('stylist_id') ?? '');
  const stylist_id = stylistRaw === '' ? null : stylistRaw;
  if (!['user', 'staff', 'admin', 'owner'].includes(role)) return { error: 'Invalid role' };
  const sb = await createClient();
  const { data: target } = await sb.from('profiles').select('role').eq('id', id).single();
  if (!target) return { error: 'User not found' };
  if (!canSetRole(actor.role, target.role as Role, role as Role)) {
    return { error: 'You are not allowed to make that change.' };
  }
  // Admin RLS allows this; the privilege trigger re-checks the same rule in the DB.
  const { error } = await sb.from('profiles').update({ role: role as Role, stylist_id }).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/admin/people');
  revalidatePath('/owner/team');
  return { ok: true };
}

export async function adminDeleteUser(formData: FormData): Promise<Result> {
  await requireRole(['admin'], '/admin/people');
  const admin = await getUser();
  const id = String(formData.get('id') ?? '');
  if (!admin || !id) return { error: 'Missing user' };
  if (!canAdminDelete(admin.id, id)) return { error: "You can't delete your own account here." };
  const res = await deleteUserData(id);
  if (!res.ok) return { error: `Delete failed (${res.step}): ${res.message}` };
  revalidatePath('/admin/people');
  return { ok: true };
}
