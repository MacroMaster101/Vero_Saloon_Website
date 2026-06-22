'use server';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { getUser } from '@/lib/supabase/auth';
import { toUtcInstant } from '@/lib/time';
import { canModifyBooking } from '@/lib/account/booking-rules';
import { getAvailability } from '@/app/book/actions';

const TZ = 'Asia/Colombo';

type Ok = { ok: true };
type Err = { ok: false; message: string };

// Load a booking the caller is allowed to modify, or an error. Ownership and
// state are verified in code because booking RLS has no user-update policy.
async function loadModifiable(bookingId: string): Promise<
  | { ok: true; userId: string; booking: { id: string; user_id: string | null; status: string; starts_at: string; service_id: string; stylist_id: string | null } }
  | Err
> {
  const user = await getUser();
  if (!user) return { ok: false, message: 'Please sign in.' };
  const admin = createAdminClient();
  const { data: booking } = await admin
    .from('bookings')
    .select('id, user_id, status, starts_at, service_id, stylist_id')
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
  revalidatePath('/account');
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

  // Service duration (re-derive from DB; never trust the client).
  const { data: service } = await admin.from('services').select('duration_min')
    .eq('id', booking.service_id).single();
  if (!service) return { ok: false, message: 'That service is unavailable.' };

  // The new time must be a currently-open slot for the same stylist — this
  // reuses all of getAvailability's guards (business hours, busy intervals,
  // past-time filtering). The DB EXCLUDE constraint is the final race guard.
  const { slots } = await getAvailability({ serviceId: booking.service_id, stylistId: booking.stylist_id, date });
  if (!slots.includes(time)) {
    return { ok: false, message: 'That time isn’t available — pick another slot.' };
  }

  const [h, mi] = time.split(':').map(Number);
  const startMin = h! * 60 + mi!;
  const startsAt = toUtcInstant(date, startMin, TZ);
  const endsAt = toUtcInstant(date, startMin + service.duration_min, TZ);

  const { error } = await admin.from('bookings')
    .update({ starts_at: startsAt, ends_at: endsAt }).eq('id', bookingId);
  if (error) {
    if (error.code === '23P01') return { ok: false, message: 'That time was just taken — pick another.' };
    return { ok: false, message: 'Could not reschedule. Please try again.' };
  }
  revalidatePath('/account');
  return { ok: true };
}
