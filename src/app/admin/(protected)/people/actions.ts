'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/supabase/auth';
import { getUser } from '@/lib/supabase/auth';
import { canAdminDelete } from '@/lib/account/guards';
import { deleteUserData } from '@/lib/account/delete';
import { canSetRole } from '@/lib/auth/role-rules';
import type { Role } from '@/lib/auth/roles';
import { env } from '@/lib/env';
import { inviteDecision, shellCardFromEmail, type InviteDecision, type InviteTarget } from '@/lib/staff/invite-rules';

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

  // Capture the linked stylist card before the profile row disappears.
  const sb = await createClient();
  const { data: target } = await sb.from('profiles').select('stylist_id').eq('id', id).single();

  const res = await deleteUserData(id);
  if (!res.ok) return { error: `Delete failed (${res.step}): ${res.message}` };

  // Offboarding removes the person's card too. Stylists with booking history
  // can't be hard-deleted (bookings keep a restrictive FK) — hide those instead.
  if (target?.stylist_id) {
    const del = await sb.from('stylists').delete().eq('id', target.stylist_id);
    if (del.error) {
      await sb.from('stylists').update({ is_active: false }).eq('id', target.stylist_id);
    }
  }

  revalidatePath('/admin/people');
  revalidatePath('/admin/stylists');
  revalidatePath('/owner/team');
  revalidatePath('/', 'layout');
  return { ok: true };
}

const inviteEmail = z.string().trim().toLowerCase().email('Enter a valid email address');

/**
 * Invite an email as staff: send the Supabase invite (new accounts), create a
 * hidden shell stylist card, and promote+link the profile — all as the acting
 * admin/owner session, because the profiles privilege trigger rejects every
 * other actor (including the service key) for role/stylist_id changes.
 */
export async function inviteStaff(formData: FormData): Promise<{ ok: true; note?: string } | { error: string }> {
  const actor = await requireRole(['admin', 'owner'], '/admin/people');
  const parsed = inviteEmail.safeParse(String(formData.get('email') ?? ''));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Enter a valid email address' };
  const email = parsed.data;

  const sb = await createClient();          // acting session: profiles + stylists writes
  const admin = createAdminClient();        // service role: email lookup + invite only

  const { data: target } = await admin.from('profiles')
    .select('id, role, stylist_id').eq('email', email).maybeSingle();
  let decision: InviteDecision = inviteDecision(actor.role, (target as InviteTarget) ?? null);
  if (decision.kind === 'already_staff') return { ok: true, note: 'That person is already staff with a card.' };
  if (decision.kind === 'refuse') return { error: decision.reason };

  let profileId: string;
  let linkedStylistId: string | null;
  if (decision.kind === 'invite_new') {
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${env.siteUrl}/auth/callback?next=${encodeURIComponent('/reset-password')}`,
    });
    if (error || !data?.user) {
      // Raced: the account appeared between lookup and invite — promote it instead.
      const { data: retry } = await admin.from('profiles')
        .select('id, role, stylist_id').eq('email', email).maybeSingle();
      if (!retry) return { error: error?.message ?? 'Could not send the invite.' };
      decision = inviteDecision(actor.role, retry as InviteTarget);
      if (decision.kind === 'already_staff') return { ok: true, note: 'That person is already staff with a card.' };
      if (decision.kind !== 'promote') return { error: decision.kind === 'refuse' ? decision.reason : 'Could not send the invite.' };
      profileId = decision.profileId;
      linkedStylistId = decision.stylistId;
    } else {
      profileId = data.user.id;              // profile row created by handle_new_user trigger
      linkedStylistId = null;
    }
  } else {
    profileId = decision.profileId;
    linkedStylistId = decision.stylistId;
  }

  if (linkedStylistId === null) {
    const [{ data: slugRows }, { data: sortRows }] = await Promise.all([
      sb.from('stylists').select('slug'),
      sb.from('stylists').select('sort_order').order('sort_order', { ascending: false }).limit(1),
    ]);
    const shell = shellCardFromEmail(email, (slugRows ?? []).map((r) => r.slug), sortRows?.[0]?.sort_order ?? 0);
    const { data: created, error: shellErr } = await sb.from('stylists').insert(shell).select('id').single();
    if (shellErr || !created) return { error: `Card setup failed (${shellErr?.message ?? 'unknown'}) — try again.` };
    linkedStylistId = created.id;

    const { error: linkErr } = await sb.from('profiles')
      .update({ role: 'staff', stylist_id: linkedStylistId }).eq('id', profileId);
    if (linkErr) {
      await sb.from('stylists').delete().eq('id', linkedStylistId); // rollback shell so a retry is clean
      return { error: `Staff setup failed (${linkErr.message}) — invite this email again.` };
    }
  } else {
    const { error: linkErr } = await sb.from('profiles')
      .update({ role: 'staff', stylist_id: linkedStylistId }).eq('id', profileId);
    if (linkErr) return { error: `Staff setup failed (${linkErr.message}) — invite this email again.` };
  }

  revalidatePath('/admin/people');
  revalidatePath('/admin/stylists');
  revalidatePath('/owner/team');
  return { ok: true, note: decision.kind === 'invite_new' ? 'Invite email sent.' : 'Existing account is now staff.' };
}
