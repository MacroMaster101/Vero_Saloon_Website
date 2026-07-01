'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/supabase/auth';
import { fetchHolidaysFromGoogle } from '@/lib/lk-holidays';
import { env } from '@/lib/env';

const PATH = '/admin/holidays';

// Pull the year's Sri Lankan holidays from Google and upsert them into the
// `holidays` table (source='google'). Manual rows are left untouched. This is
// the only place Google is contacted — the public calendar reads from the DB.
export async function syncHolidays(formData: FormData): Promise<{ error: string } | { ok: true; count: number }> {
  await requireRole(['admin'], PATH);
  const year = Number(formData.get('year')) || new Date().getFullYear();

  if (!env.googleCalendarKey) {
    return { error: 'GOOGLE_CALENDAR_API_KEY is not set — add it to your environment first.' };
  }
  const list = await fetchHolidaysFromGoogle(year);
  if (list.length === 0) {
    return { error: 'Google returned no holidays (check the API key and that Calendar API is enabled).' };
  }

  // Google can return several events on the same date (e.g. a poya day that's
  // also a public holiday, or duplicate listings). Postgres upsert can't touch
  // the same row twice in one statement, so collapse to one entry per date —
  // joining the distinct names so the calendar still shows what the day is.
  const byDate = new Map<string, string>();
  for (const h of list) {
    const prev = byDate.get(h.date);
    if (!prev) byDate.set(h.date, h.name);
    else if (!prev.includes(h.name)) byDate.set(h.date, `${prev} / ${h.name}`);
  }
  const rows = [...byDate].map(([date, name]) => ({
    date, name, source: 'google' as const, is_closed: true, updated_at: new Date().toISOString(),
  }));

  const sb = await createClient();
  // Upsert by primary key (date); re-running is safe and refreshes names.
  const { error } = await sb.from('holidays').upsert(rows, { onConflict: 'date' });
  if (error) return { error: error.message };

  revalidatePath(PATH);
  return { ok: true, count: rows.length };
}

// Add a one-off closure by hand (e.g. a salon-specific holiday).
export async function addManualHoliday(formData: FormData): Promise<{ error: string } | { ok: true }> {
  await requireRole(['admin'], PATH);
  const date = String(formData.get('date') ?? '');
  const name = String(formData.get('name') ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: 'Pick a valid date.' };
  if (name.length < 2) return { error: 'Enter a name for the holiday.' };

  const sb = await createClient();
  const { error } = await sb.from('holidays').upsert(
    { date, name, source: 'manual', is_closed: true, updated_at: new Date().toISOString() },
    { onConflict: 'date' },
  );
  if (error) return { error: error.message };
  revalidatePath(PATH);
  return { ok: true };
}

export async function deleteHoliday(formData: FormData): Promise<void> {
  await requireRole(['admin'], PATH);
  const date = String(formData.get('date') ?? '');
  if (date) {
    const sb = await createClient();
    await sb.from('holidays').delete().eq('date', date);
  }
  revalidatePath(PATH);
}
