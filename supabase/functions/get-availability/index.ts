import { createClient } from 'jsr:@supabase/supabase-js@2';
import { computeOpenSlots, type Interval } from '../_shared/availability.ts';
import { toUtcInstant, minutesOfDayInTz } from '../_shared/time.ts';

const TZ = 'Asia/Colombo';
const STEP_MIN = 30;
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type, apikey' };

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

async function busyIntervals(stylistId: string | null, date: string): Promise<Interval[]> {
  const dayStart = toUtcInstant(date, 0, TZ);
  const dayEnd = toUtcInstant(date, 1440, TZ);
  const intervals: Interval[] = [];
  let bq = admin.from('bookings').select('starts_at,ends_at,stylist_id').eq('status', 'confirmed').gte('starts_at', dayStart).lt('starts_at', dayEnd);
  if (stylistId) bq = bq.eq('stylist_id', stylistId);
  const { data: bookings } = await bq;
  for (const b of bookings ?? []) intervals.push({ startMin: minutesOfDayInTz(b.starts_at, TZ), endMin: minutesOfDayInTz(b.ends_at, TZ) || 1440 });
  const { data: blocks } = await admin.from('blocked_slots').select('starts_at,ends_at,stylist_id').lt('starts_at', dayEnd).gt('ends_at', dayStart);
  for (const bl of blocks ?? []) {
    if (stylistId && bl.stylist_id && bl.stylist_id !== stylistId) continue;
    intervals.push({ startMin: minutesOfDayInTz(bl.starts_at, TZ), endMin: minutesOfDayInTz(bl.ends_at, TZ) || 1440 });
  }
  return intervals;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  // Accept multi-service `serviceIds[]` (preferred) or a single legacy `serviceId`.
  const body = await req.json();
  const serviceIds: string[] = Array.isArray(body.serviceIds) && body.serviceIds.length > 0
    ? body.serviceIds : (body.serviceId ? [body.serviceId] : []);
  const { stylistId, date } = body;
  if (serviceIds.length === 0) return Response.json({ slots: [] }, { headers: cors });
  // Combined visit: availability must fit the summed duration of all services.
  const { data: rows } = await admin.from('services').select('duration_min').in('id', serviceIds);
  if (!rows || rows.length === 0) return Response.json({ slots: [] }, { headers: cors });
  const durationMin = rows.reduce((sum, r) => sum + r.duration_min, 0);
  const [y, m, d] = date.split('-').map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const { data: hours } = await admin.from('business_hours').select('*').eq('day_of_week', dow).single();
  if (!hours || hours.is_closed) return Response.json({ slots: [] }, { headers: cors });

  if (!stylistId) {
    const { data: stylists } = await admin.from('stylists').select('id').eq('is_active', true);
    const sets = await Promise.all((stylists ?? []).map(async (s) =>
      computeOpenSlots({ date, hours, durationMin, stepMin: STEP_MIN, busy: await busyIntervals(s.id, date), tz: TZ })));
    return Response.json({ slots: Array.from(new Set(sets.flat())).sort() }, { headers: cors });
  }
  const busy = await busyIntervals(stylistId, date);
  return Response.json({ slots: computeOpenSlots({ date, hours, durationMin, stepMin: STEP_MIN, busy, tz: TZ }) }, { headers: cors });
});
