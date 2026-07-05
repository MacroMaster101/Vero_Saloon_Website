'use server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getUser } from '@/lib/supabase/auth';
import { getMyBookings } from '@/lib/queries';
import { toUtcInstant } from '@/lib/time';
import { canModifyBooking } from '@/lib/account/booking-rules';
import { getAvailability } from '@/app/book/actions';
import { notifyBookingCancelled, notifyBookingRescheduled } from '@/lib/notify';
import { buildBookingChange } from '@/lib/notify/change-payload';

const TZ = 'Asia/Colombo';

type Ok = { ok: true };
type Err = { ok: false; message: string };

export type MyBookingRow = {
  id: string;
  reference: string;
  starts_at: string;
  status: string;
  service_id: string;
  service_ids: string[] | null;
  stylist_id: string | null;
};

// The signed-in caller's booking history, for the bookings popup.
export async function listMyBookings(): Promise<{ ok: true; bookings: MyBookingRow[] } | Err> {
  const user = await getUser();
  if (!user) return { ok: false, message: 'Please sign in.' };
  const bookings = await getMyBookings(user.id, user.email ?? null);
  return {
    ok: true,
    bookings: bookings.map((b) => ({
      id: b.id, reference: b.reference, starts_at: b.starts_at, status: b.status,
      service_id: b.service_id, service_ids: b.service_ids, stylist_id: b.stylist_id,
    })),
  };
}

type ModifiableBooking = {
  id: string; user_id: string | null; status: string; starts_at: string;
  service_id: string; service_ids: string[] | null; stylist_id: string | null;
  reference: string; customer_name: string; customer_phone: string; customer_email: string | null;
};

// Load a booking the caller is allowed to modify, or an error. Ownership and
// state are verified in code because booking RLS has no user-update policy.
async function loadModifiable(bookingId: string): Promise<
  | { ok: true; userId: string; booking: ModifiableBooking }
  | Err
> {
  const user = await getUser();
  if (!user) return { ok: false, message: 'Please sign in.' };
  const admin = createAdminClient();
  const { data: booking } = await admin
    .from('bookings')
    .select('id, user_id, status, starts_at, service_id, service_ids, stylist_id, reference, customer_name, customer_phone, customer_email')
    .eq('id', bookingId)
    .single();
  if (!booking) return { ok: false, message: 'Booking not found.' };
  const decision = canModifyBooking(booking, user.id, Date.now());
  if (!decision.ok) {
    const msg = decision.reason === 'in_past' ? 'That booking has already passed.'
      : decision.reason === 'not_active' ? 'That booking can no longer be changed.'
      : 'You can only change your own bookings.';
    return { ok: false, message: msg };
  }
  return { ok: true, userId: user.id, booking };
}


export async function cancelMyBooking(bookingId: string): Promise<Ok | Err> {
  const loaded = await loadModifiable(bookingId);
  if (!loaded.ok) return loaded;
  const admin = createAdminClient();
  const { error } = await admin.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId);
  if (error) return { ok: false, message: 'Could not cancel. Please try again.' };
  try {
    await notifyBookingCancelled(await buildBookingChange(loaded.booking));
  } catch (err) {
    console.error('[notify] cancel notification failed:', err);
  }
  return { ok: true };
}

export async function rescheduleMyBooking(
  bookingId: string,
  date: string,
  time: string,
): Promise<Ok | Err> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return { ok: false, message: 'Pick a valid date and time.' };
  }
  const loaded = await loadModifiable(bookingId);
  if (!loaded.ok) return loaded;
  const { booking } = loaded;
  const admin = createAdminClient();

  // Combined-visit duration: re-derive from DB for every service on the booking
  // (old single-service rows have service_ids = null → fall back to service_id).
  const serviceIds = booking.service_ids?.length ? booking.service_ids : [booking.service_id];
  const { data: rows } = await admin.from('services').select('duration_min').in('id', serviceIds);
  if (!rows || rows.length === 0) return { ok: false, message: 'That service is unavailable.' };
  const durationMin = rows.reduce((sum, r) => sum + r.duration_min, 0);

  // The new time must be a currently-open slot for the same stylist — this
  // reuses all of getAvailability's guards (business hours, busy intervals,
  // past-time filtering). The DB EXCLUDE constraint is the final race guard.
  const { slots } = await getAvailability({ serviceIds, stylistId: booking.stylist_id, date });
  if (!slots.includes(time)) {
    return { ok: false, message: 'That time isn’t available — pick another slot.' };
  }

  const [h, mi] = time.split(':').map(Number);
  const startMin = h! * 60 + mi!;
  const startsAt = toUtcInstant(date, startMin, TZ);
  const endsAt = toUtcInstant(date, startMin + durationMin, TZ);

  const { error } = await admin.from('bookings')
    .update({ starts_at: startsAt, ends_at: endsAt }).eq('id', bookingId);
  if (error) {
    if (error.code === '23P01') return { ok: false, message: 'That time was just taken — pick another.' };
    return { ok: false, message: 'Could not reschedule. Please try again.' };
  }
  try {
    await notifyBookingRescheduled(await buildBookingChange(booking, startsAt));
  } catch (err) {
    console.error('[notify] reschedule notification failed:', err);
  }
  return { ok: true };
}
