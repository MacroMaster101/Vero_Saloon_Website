import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { env } from '@/lib/env';

// Sri Lankan holidays are served to the public booking calendar straight from
// our `holidays` DB table — never from Google at request time. That makes the
// calendar fast and immune to Google API rate limits no matter how many users
// book. Google is only contacted when an admin runs a sync (see fetchFromGoogle),
// which upserts rows into the table. Rows can also be added by hand (manual
// salon closures). See supabase/migrations/0009_holidays.sql.

export type Holiday = { date: string; name: string }; // date = YYYY-MM-DD (salon-local)

// Google's official "Holidays in Sri Lanka" public calendar.
const LK_HOLIDAY_CAL = 'en.lk#holiday@group.v.calendar.google.com';

// ── read path (public calendar) ────────────────────────────
// All bookable-blocking holidays in [monthStart, nextMonthStart) as a
// { 'YYYY-MM-DD': name } map for O(1) lookups in the calendar UI.
export async function getHolidayMap(year: number, month0: number): Promise<Record<string, string>> {
  const from = ymd(year, month0, 1);
  const to = ymd(year, month0 + 1, 1); // exclusive upper bound
  const sb = await createClient();
  const { data } = await sb
    .from('holidays')
    .select('date, name')
    .eq('is_closed', true)
    .gte('date', from)
    .lt('date', to);
  const map: Record<string, string> = {};
  for (const h of data ?? []) map[h.date] = h.name;
  return map;
}

// ── sync path (admin only) ─────────────────────────────────
type GCalItem = { summary?: string; start?: { date?: string } };

// Fetch holidays for a whole year from Google. Returns [] (no throw) when the
// key is unset or the request fails, so the admin sync degrades gracefully.
export async function fetchHolidaysFromGoogle(year: number): Promise<Holiday[]> {
  const key = env.googleCalendarKey;
  if (!key) return [];

  const timeMin = new Date(Date.UTC(year, 0, 1)).toISOString();
  const timeMax = new Date(Date.UTC(year + 1, 0, 1)).toISOString();
  const url =
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(LK_HOLIDAY_CAL)}/events` +
    `?key=${key}&timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}` +
    `&singleEvents=true&orderBy=startTime&maxResults=250`;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = (await res.json()) as { items?: GCalItem[] };
    const out: Holiday[] = [];
    for (const it of data.items ?? []) {
      const date = it.start?.date; // all-day holidays carry start.date
      if (!date) continue;
      out.push({ date, name: it.summary?.trim() || 'Holiday' });
    }
    return out;
  } catch {
    return [];
  }
}

// Local YYYY-MM-DD from Y / month0 / day (no UTC drift; the flow is salon-local).
function ymd(y: number, m0: number, d: number): string {
  // Normalise month overflow (e.g. month0 = 12 → next January) via Date.
  const dt = new Date(y, m0, d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}
