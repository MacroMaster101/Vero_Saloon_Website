'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/supabase/auth';
import { stylistInputSchema } from '@/lib/admin/stylist-schema';

type Result = { ok: true } | { error: string };
const PATH = '/admin/stylists';

function parse(fd: FormData) {
  return stylistInputSchema.safeParse({
    name: fd.get('name') ?? '',
    slug: fd.get('slug') ?? '',
    role: fd.get('role') ?? '',
    tags: fd.get('tags') ?? '',
    avatar_url: fd.get('avatar_url') ?? '',
    sort_order: fd.get('sort_order') ?? '0',
    is_active: fd.get('is_active') ? 'true' : '',
  });
}
function revalidate() { revalidatePath(PATH); revalidatePath('/'); }

export async function createStylist(fd: FormData): Promise<Result> {
  await requireRole(['admin'], PATH);
  const parsed = parse(fd);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  const sb = await createClient();
  const { error } = await sb.from('stylists').insert(parsed.data);
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}

export async function updateStylist(fd: FormData): Promise<Result> {
  await requireRole(['admin'], PATH);
  const id = String(fd.get('id') ?? '');
  if (!id) return { error: 'Missing stylist id' };
  const parsed = parse(fd);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  const sb = await createClient();
  const { error } = await sb.from('stylists').update(parsed.data).eq('id', id);
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}

export async function deleteStylist(fd: FormData): Promise<void> {
  await requireRole(['admin'], PATH);
  const id = String(fd.get('id') ?? '');
  if (!id) return;
  const sb = await createClient();
  await sb.from('stylists').delete().eq('id', id);
  revalidate();
}
