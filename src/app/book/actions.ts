'use server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getUser } from '@/lib/supabase/auth';
import { computeOpenSlots, dropPastSlots, type Interval } from '@/lib/availability';
import { toUtcInstant, minutesOfDayInTz } from '@/lib/time';
import { createBookingSchema, type CreateBookingInput } from '@/lib/validators';
import { makeReference } from '@/lib/reference';
import { notifyBookingConfirmed } from '@/lib/notify';
import { getHolidayMap } from '@/lib/lk-holidays';

// Sri Lankan holidays for a month, as { 'YYYY-MM-DD': name }, read from our
// `holidays` DB table (never Google directly — see lib/lk-holidays). Used by the
// booking calendar to block holiday dates.
export async function getMonthHolidays(year: number, month0: number): Promise<Record<string, string>> {
  return getHolidayMap(year, month0);
}

const TZ = 'Asia/Colombo';
const STEP_MIN = 30;

// Busy intervals (confirmed bookings + blocks) for a stylist on a given salon-local day.
async function busyIntervals(stylistId: string | null, date: string): Promise<Interval[]> {
  const admin = createAdminClient();
  const dayStart = toUtcInstant(date, 0, TZ);
  const dayEnd = toUtcInstant(date, 1440, TZ);
  const intervals: Interval[] = [];

  let bq = admin.from('bookings').select('starts_at,ends_at,stylist_id')
    .eq('status', 'confirmed').gte('starts_at', dayStart).lt('starts_at', dayEnd);
  if (stylistId) bq = bq.eq('stylist_id', stylistId);
  const { data: bookings } = await bq;
  for (const b of bookings ?? []) {
    intervals.push({
      startMin: minutesOfDayInTz(b.starts_at, TZ),
      endMin: minutesOfDayInTz(b.ends_at, TZ) || 1440,
    });
  }

  const { data: blocks } = await admin.from('blocked_slots').select('starts_at,ends_at,stylist_id')
    .lt('starts_at', dayEnd).gt('ends_at', dayStart);
  for (const bl of blocks ?? []) {
    if (stylistId && bl.stylist_id && bl.stylist_id !== stylistId) continue;
    intervals.push({
      startMin: minutesOfDayInTz(bl.starts_at, TZ),
      endMin: minutesOfDayInTz(bl.ends_at, TZ) || 1440,
    });
  }
  return intervals;
}

export async function getAvailability(input: { serviceIds: string[]; stylistId: string | null; date: string }) {
  const sb = await createClient();
  if (input.serviceIds.length === 0) return { slots: [] as string[] };
  // Combined visit: availability must fit the summed duration of all services.
  const { data: rows } = await sb.from('services').select('duration_min').in('id', input.serviceIds);
  if (!rows || rows.length === 0) return { slots: [] as string[] };
  const durationMin = rows.reduce((sum, r) => sum + r.duration_min, 0);

  const parts = input.date.split('-').map(Number);
  const y = parts[0]!, m = parts[1]!, d = parts[2]!;
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const { data: hours } = await sb.from('business_hours').select('*').eq('day_of_week', dow).single();
  if (!hours || hours.is_closed) return { slots: [] as string[] };

  // Convert an 'HH:MM' slot to its UTC epoch ms so past times (today) drop out.
  // For a future date every slot is after now, so this is a no-op.
  const toMs = (hhmm: string) => {
    const [h, mi] = hhmm.split(':').map(Number);
    return new Date(toUtcInstant(input.date, h! * 60 + mi!, TZ)).getTime();
  };
  const now = Date.now();

  // "Any" stylist: a time is open if ANY active stylist is free → union.
  if (!input.stylistId) {
    const { data: stylists } = await sb.from('stylists').select('id').eq('is_active', true);
    const sets = await Promise.all((stylists ?? []).map(async (s) =>
      computeOpenSlots({ date: input.date, hours, durationMin, stepMin: STEP_MIN, busy: await busyIntervals(s.id, input.date), tz: TZ }),
    ));
    const union = Array.from(new Set(sets.flat())).sort();
    return { slots: dropPastSlots(union, toMs, now) };
  }

  const busy = await busyIntervals(input.stylistId, input.date);
  const slots = computeOpenSlots({ date: input.date, hours, durationMin, stepMin: STEP_MIN, busy, tz: TZ });
  return { slots: dropPastSlots(slots, toMs, now) };
}

export type CreateResult =
  | { ok: true; reference: string; whenLabel: string; stylistName: string; serviceName: string; serviceNames: string[]; priceLkr: number; durationMin: number; isGuest: boolean; email: string }
  | { ok: false; error: 'invalid' | 'slot_taken' | 'closed' | 'unknown'; message: string };

export async function createBooking(raw: CreateBookingInput): Promise<CreateResult> {
  const parsed = createBookingSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: 'invalid', message: 'Please check your details.' };
  const input = parsed.data;

  const admin = createAdminClient();
  const sessionUser = await getUser();
  // Re-derive price + duration from DB for every chosen service (never trust
  // client). Dedupe ids, then preserve the client's order so the first pick
  // stays the "primary" service written to bookings.service_id.
  const serviceIds = Array.from(new Set(input.serviceIds));
  const { data: rows } = await admin.from('services').select('id,name,duration_min,price_lkr')
    .in('id', serviceIds).eq('is_active', true);
  if (!rows || rows.length !== serviceIds.length) {
    return { ok: false, error: 'invalid', message: 'One of those services is unavailable.' };
  }
  const services = serviceIds.map((id) => rows.find((r) => r.id === id)!);
  const primary = services[0]!;
  const totalDuration = services.reduce((sum, s) => sum + s.duration_min, 0);
  const totalPrice = services.reduce((sum, s) => sum + s.price_lkr, 0);
  const serviceNames = services.map((s) => s.name);
  const combinedName = serviceNames.length === 1
    ? serviceNames[0]!
    : `${serviceNames[0]} + ${serviceNames.length - 1} more`;

  const tparts = input.time.split(':').map(Number);
  const hh = tparts[0]!, mm = tparts[1]!;
  const startMin = hh * 60 + mm;
  const startsAt = toUtcInstant(input.date, startMin, TZ);
  const endsAt = toUtcInstant(input.date, startMin + totalDuration, TZ);

  // Reject already-passed times (a stale client could submit a slot we no
  // longer show; availability already trims these, this is the server guard).
  if (new Date(startsAt).getTime() < Date.now()) {
    return { ok: false, error: 'closed', message: 'That time has already passed — pick another slot.' };
  }

  // Re-check business hours at insert time (availability could be stale).
  const dparts = input.date.split('-').map(Number);
  const dow = new Date(Date.UTC(dparts[0]!, dparts[1]! - 1, dparts[2]!)).getUTCDay();
  const { data: hours } = await admin.from('business_hours')
    .select('open_minute, close_minute, is_closed').eq('day_of_week', dow).single();
  if (!hours || hours.is_closed
      || startMin < hours.open_minute
      || startMin + totalDuration > hours.close_minute) {
    return { ok: false, error: 'closed', message: 'We’re closed at that time — pick another slot.' };
  }

  // Resolve stylist: chosen one, or first free for "any".
  let stylistId: string | null = input.stylistId;
  let stylistName = 'Next available stylist';
  if (stylistId) {
    const { data: st } = await admin.from('stylists').select('name').eq('id', stylistId).single();
    if (!st) return { ok: false, error: 'invalid', message: 'That stylist is unavailable.' };
    stylistName = st.name;
  } else {
    const { data: stylists } = await admin.from('stylists').select('id,name').eq('is_active', true).order('sort_order');
    for (const s of stylists ?? []) {
      const busy = await busyIntervals(s.id, input.date);
      const free = !busy.some((b) => startMin < b.endMin && b.startMin < startMin + totalDuration);
      if (free) { stylistId = s.id; stylistName = s.name; break; }
    }
    if (!stylistId) return { ok: false, error: 'slot_taken', message: 'That time was just taken — pick another.' };
  }

  // Insert with retry on reference collision; the EXCLUDE constraint guards overlaps.
  for (let attempt = 0; attempt < 3; attempt++) {
    const reference = makeReference();
    const { error } = await admin.from('bookings').insert({
      reference, service_id: primary.id, service_ids: serviceIds, stylist_id: stylistId,
      customer_name: input.name, customer_phone: input.phone,
      customer_email: input.email || null, notes: input.notes,
      starts_at: startsAt, ends_at: endsAt, status: 'confirmed',
      user_id: sessionUser?.id ?? null,
    });
    if (!error) {
      const whenLabel = new Intl.DateTimeFormat('en-LK', {
        timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short',
        hour: 'numeric', minute: '2-digit', hour12: true,
      }).format(new Date(startsAt));
      await notifyBookingConfirmed({
        reference, customerName: input.name, customerEmail: input.email || null, customerPhone: input.phone,
        serviceName: serviceNames.join(', '), stylistName, whenLabel, priceLkr: totalPrice, durationMin: totalDuration,
      });
      return { ok: true, reference, whenLabel, stylistName, serviceName: combinedName, serviceNames, priceLkr: totalPrice, durationMin: totalDuration, isGuest: !sessionUser, email: input.email || '' };
    }
    if (error.code === '23505') continue; // reference collision → retry
    if (error.code === '23P01') return { ok: false, error: 'slot_taken', message: 'That time was just taken — pick another.' };
    return { ok: false, error: 'unknown', message: 'Something went wrong. Please call us.' };
  }
  return { ok: false, error: 'unknown', message: 'Could not generate a reference. Please retry.' };
}
