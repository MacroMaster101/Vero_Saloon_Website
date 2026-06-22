'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/supabase/auth';
import { galleryInputSchema } from '@/lib/admin/gallery-schema';

type Result = { ok: true } | { error: string };
const PATH = '/admin/gallery';

function parse(fd: FormData) {
  return galleryInputSchema.safeParse({
    title: fd.get('title') ?? '',
    tag: fd.get('tag') ?? '',
    category: fd.get('category') ?? '',
    image_url: fd.get('image_url') ?? '',
    sort_order: fd.get('sort_order') ?? '0',
    is_active: fd.get('is_active') ? 'true' : '',
  });
}
function revalidate() { revalidatePath(PATH); revalidatePath('/'); }

export async function createGalleryItem(fd: FormData): Promise<Result> {
  await requireRole(['admin'], PATH);
  const parsed = parse(fd);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  const sb = await createClient();
  const { error } = await sb.from('gallery').insert(parsed.data);
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}

export async function updateGalleryItem(fd: FormData): Promise<Result> {
  await requireRole(['admin'], PATH);
  const id = String(fd.get('id') ?? '');
  if (!id) return { error: 'Missing gallery id' };
  const parsed = parse(fd);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  const sb = await createClient();
  const { error } = await sb.from('gallery').update(parsed.data).eq('id', id);
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}

export async function deleteGalleryItem(fd: FormData): Promise<void> {
  await requireRole(['admin'], PATH);
  const id = String(fd.get('id') ?? '');
  if (!id) return;
  const sb = await createClient();
  await sb.from('gallery').delete().eq('id', id);
  revalidate();
}
