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
    image_url: formData.get('image_url') ?? '',
    bookable: formData.get('bookable') ? 'true' : '',
    is_active: formData.get('is_active') ? 'true' : '',
    sort_order: formData.get('sort_order') ?? '0',
  });
}

function revalidate() {
  revalidatePath(PATH);
  revalidatePath('/');
}

/** Postgres "undefined_column" — image_url exists in the schema/types but the
 *  0006 migration may not be applied yet. Strip it and retry so admin service
 *  edits keep working before the migration runs. */
function isMissingImageColumn(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === '42703' || /image_url/.test(error.message ?? '');
}

export async function createService(formData: FormData): Promise<Result> {
  await requireRole(['admin'], PATH);
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  const sb = await createClient();
  let { error } = await sb.from('services').insert(parsed.data);
  if (error && isMissingImageColumn(error)) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { image_url: _image_url, ...rest } = parsed.data;
    ({ error } = await sb.from('services').insert(rest));
  }
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
  let { error } = await sb.from('services').update(parsed.data).eq('id', id);
  if (error && isMissingImageColumn(error)) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { image_url: _image_url, ...rest } = parsed.data;
    ({ error } = await sb.from('services').update(rest).eq('id', id));
  }
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
