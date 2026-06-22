'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/supabase/auth';
import { hoursDaySchema } from '@/lib/admin/hours-schema';

type Result = { ok: true } | { error: string };
const PATH = '/admin/content';

export async function saveHours(fd: FormData): Promise<Result> {
  await requireRole(['admin'], PATH);
  const rows = [];
  for (let dow = 0; dow <= 6; dow++) {
    const parsed = hoursDaySchema.safeParse({
      day_of_week: dow,
      open_minute: fd.get(`open_${dow}`) ?? '0',
      close_minute: fd.get(`close_${dow}`) ?? '0',
      is_closed: fd.get(`closed_${dow}`) ? 'true' : '',
    });
    if (!parsed.success) return { error: `Day ${dow}: ${parsed.error.issues[0]?.message ?? 'invalid'}` };
    rows.push(parsed.data);
  }
  const sb = await createClient();
  const { error } = await sb.from('business_hours').upsert(rows, { onConflict: 'day_of_week' });
  if (error) return { error: error.message };
  revalidatePath(PATH);
  revalidatePath('/');
  return { ok: true };
}
