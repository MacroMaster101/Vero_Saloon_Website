import { createClient } from 'jsr:@supabase/supabase-js@2';
import { type Interval } from '../_shared/availability.ts';
import { toUtcInstant, minutesOfDayInTz } from '../_shared/time.ts';
import { makeReference } from '../_shared/reference.ts';
import { createBookingSchema, normalizeServiceIds } from '../_shared/validators.ts';

const TZ = 'Asia/Colombo';
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type, apikey' };
const url = Deno.env.get('SUPABASE_URL')!;
const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

async function busyIntervals(stylistId: string | null, date: string): Promise<Interval[]> {
  const dayStart = toUtcInstant(date, 0, TZ), dayEnd = toUtcInstant(date, 1440, TZ);
  const out: Interval[] = [];
  let bq = admin.from('bookings').select('starts_at,ends_at,stylist_id').eq('status', 'confirmed').gte('starts_at', dayStart).lt('starts_at', dayEnd);
  if (stylistId) bq = bq.eq('stylist_id', stylistId);
  const { data: bookings } = await bq;
  for (const b of bookings ?? []) out.push({ startMin: minutesOfDayInTz(b.starts_at, TZ), endMin: minutesOfDayInTz(b.ends_at, TZ) || 1440 });
  const { data: blocks } = await admin.from('blocked_slots').select('starts_at,ends_at,stylist_id').lt('starts_at', dayEnd).gt('ends_at', dayStart);
  for (const bl of blocks ?? []) { if (stylistId && bl.stylist_id && bl.stylist_id !== stylistId) continue; out.push({ startMin: minutesOfDayInTz(bl.starts_at, TZ), endMin: minutesOfDayInTz(bl.ends_at, TZ) || 1440 }); }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const parsed = createBookingSchema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ ok: false, error: 'invalid', message: 'Please check your details.' }, { headers: cors });
  const input = parsed.data;

  const authHeader = req.headers.get('Authorization') ?? '';
  const userClient = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
  const { data: { user } } = await userClient.auth.getUser();

  // Re-derive price + duration for every chosen service (never trust the client).
  // Preserve the client's order so the first pick is the "primary" service_id.
  const serviceIds = normalizeServiceIds(input);
  const { data: rows } = await admin.from('services').select('id,name,duration_min,price_lkr').in('id', serviceIds).eq('is_active', true);
  if (!rows || rows.length !== serviceIds.length) return Response.json({ ok: false, error: 'invalid', message: 'One of those services is unavailable.' }, { headers: cors });
  const services = serviceIds.map((id) => rows.find((r) => r.id === id)!);
  const primary = services[0]!;
  const totalDuration = services.reduce((sum, s) => sum + s.duration_min, 0);
  const totalPrice = services.reduce((sum, s) => sum + s.price_lkr, 0);
  const serviceNames = services.map((s) => s.name);
  const combinedName = serviceNames.length === 1 ? serviceNames[0]! : `${serviceNames[0]} + ${serviceNames.length - 1} more`;

  const [hh, mm] = input.time.split(':').map(Number);
  const startMin = hh * 60 + mm;
  const startsAt = toUtcInstant(input.date, startMin, TZ);
  const endsAt = toUtcInstant(input.date, startMin + totalDuration, TZ);

  let stylistId: string | null = input.stylistId;
  let stylistName = 'Next available stylist';
  if (stylistId) {
    const { data: st } = await admin.from('stylists').select('name').eq('id', stylistId).single();
    if (!st) return Response.json({ ok: false, error: 'invalid', message: 'That stylist is unavailable.' }, { headers: cors });
    stylistName = st.name;
  } else {
    const { data: stylists } = await admin.from('stylists').select('id,name').eq('is_active', true).order('sort_order');
    let chosen = false;
    for (const s of stylists ?? []) {
      const busy = await busyIntervals(s.id, input.date);
      if (!busy.some((b) => startMin < b.endMin && b.startMin < startMin + totalDuration)) { stylistId = s.id; stylistName = s.name; chosen = true; break; }
    }
    if (!chosen) return Response.json({ ok: false, error: 'slot_taken', message: 'That time was just taken — pick another.' }, { headers: cors });
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    const reference = makeReference();
    const { error } = await admin.from('bookings').insert({
      reference, service_id: primary.id, service_ids: serviceIds, stylist_id: stylistId,
      customer_name: input.name, customer_phone: input.phone, customer_email: input.email || null,
      notes: input.notes, starts_at: startsAt, ends_at: endsAt, status: 'confirmed', user_id: user?.id ?? null,
    });
    if (!error) {
      const whenLabel = new Intl.DateTimeFormat('en-LK', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(startsAt));
      return Response.json({ ok: true, reference, whenLabel, stylistName, serviceName: combinedName, serviceNames, priceLkr: totalPrice, durationMin: totalDuration }, { headers: cors });
    }
    if (error.code === '23505') continue;
    if (error.code === '23P01') return Response.json({ ok: false, error: 'slot_taken', message: 'That time was just taken — pick another.' }, { headers: cors });
    return Response.json({ ok: false, error: 'unknown', message: 'Something went wrong. Please call us.' }, { headers: cors });
  }
  return Response.json({ ok: false, error: 'unknown', message: 'Could not generate a reference. Please retry.' }, { headers: cors });
});
