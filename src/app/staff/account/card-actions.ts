'use server';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/supabase/auth';
import { parseCardInput } from '@/lib/staff/card-input';

// Staff edit their own public card (title + tags + visibility). Name/photo flow
// through the profile form + identity sync; slug/order stay admin/owner-only.
export async function updateMyPublicCard(
  input: { role: string; tags: string; isActive: boolean },
): Promise<{ ok: true } | { error: string }> {
  const profile = await requireRole(['staff', 'admin', 'owner'], '/staff/account');
  if (!profile.stylistId) return { error: 'Your account isn’t linked to a stylist yet.' };

  const parsed = parseCardInput(input.role, input.tags);
  const admin = createAdminClient();
  const { error } = await admin.from('stylists')
    .update({ role: parsed.role, tags: parsed.tags, is_active: input.isActive === true })
    .eq('id', profile.stylistId);
  if (error) return { error: error.message };

  revalidatePath('/', 'layout');
  revalidatePath('/staff/account');
  revalidatePath('/admin/stylists');
  revalidatePath('/owner/team');
  return { ok: true };
}
