'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/supabase/auth';
import { serviceInputSchema } from '@/lib/admin/service-schema';

type Result = { ok: true } | { error: string };

const PATH = '/admin/services';

function parse(formData: FormData) {
  return serviceInputSchema.safeParse({
    name: formData.get('name') ?? '',
    slug: formData.get('slug') ?? '',
    description: formData.get('description') ?? '',
    category: formData.get('category') ?? 'hair',
    price_lkr: formData.get('price_lkr') ?? '0',
    duration_min: formData.get('duration_min') ?? '1',
    icon: formData.get('icon') ?? 'scissors',
    bookable: formData.get('bookable') ? 'true' : '',
    is_active: formData.get('is_active') ? 'true' : '',
    sort_order: formData.get('sort_order') ?? '0',
  });
}

function revalidate() {
  revalidatePath(PATH);
  revalidatePath('/');
}

export async function createService(formData: FormData): Promise<Result> {
  await requireRole(['admin'], PATH);
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  const sb = await createClient();
  const { error } = await sb.from('services').insert(parsed.data);
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}

export async function updateService(formData: FormData): Promise<Result> {
  await requireRole(['admin'], PATH);
  const id = String(formData.get('id') ?? '');
  if (!id) return { error: 'Missing service id' };
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  const sb = await createClient();
  const { error } = await sb.from('services').update(parsed.data).eq('id', id);
  if (error) return { error: error.message };
  revalidate();
  return { ok: true };
}

export async function deleteService(formData: FormData): Promise<void> {
  await requireRole(['admin'], PATH);
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  const sb = await createClient();
  await sb.from('services').delete().eq('id', id);
  revalidate();
}

export async function reorderService(formData: FormData): Promise<void> {
  await requireRole(['admin'], PATH);
  const id = String(formData.get('id') ?? '');
  const sort_order = Number(formData.get('sort_order') ?? 0);
  if (!id || Number.isNaN(sort_order)) return;
  const sb = await createClient();
  await sb.from('services').update({ sort_order }).eq('id', id);
  revalidate();
}
