'use server';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/supabase/auth';
import { canStaffSetStatus, canStaffReschedule } from '@/lib/staff/action-rules';
import { getAvailability } from '@/app/book/actions';
import { toUtcInstant } from '@/lib/time';
import { notifyBookingCancelled, notifyBookingRescheduled } from '@/lib/notify';
import { buildBookingChange } from '@/lib/notify/change-payload';
import type { AdminBookingStatus } from '@/lib/staff/view';

const TZ = 'Asia/Colombo';

type ActionBookingRow = {
  id: string; stylist_id: string | null; status: string; starts_at: string;
  service_id: string; service_ids: string[] | null; reference: string;
  customer_name: string; customer_phone: string; customer_email: string | null;
};

const ROW_COLUMNS =
  'id, stylist_id, status, starts_at, service_id, service_ids, reference, customer_name, customer_phone, customer_email';

function revalidateStaff() {
  revalidatePath('/staff');
  revalidatePath('/staff/schedule');
}

export async function staffSetBookingStatus(
  id: string,
  status: AdminBookingStatus,
): Promise<{ ok: true } | { error: string }> {
  const profile = await requireRole(['staff', 'admin', 'owner'], '/staff');
  const admin = createAdminClient();
  const { data } = await admin.from('bookings').select(ROW_COLUMNS).eq('id', id).single();
  if (!data) return { error: 'Booking not found.' };
  const booking = data as ActionBookingRow;

  const decision = canStaffSetStatus(booking, { role: profile.role, stylistId: profile.stylistId }, status);
  if (!decision.ok) {
    return { error: decision.reason === 'not_your_chair' ? 'That booking isn’t on your chair.' : 'That change isn’t allowed.' };
  }

  const { error } = await admin.from('bookings').update({ status }).eq('id', id);
  if (error) {
    if (error.code === '23P01') return { error: 'That time was taken by another booking — can’t undo.' };
    return { error: 'Could not update. Please try again.' };
  }

  if (status === 'cancelled') {
    try { await notifyBookingCancelled(await buildBookingChange(booking)); }
    catch (err) { console.error('[notify] staff cancel notification failed:', err); }
  }
  revalidateStaff();
  return { ok: true };
}

export async function staffRescheduleOptions(
  bookingId: string,
  date: string,
): Promise<{ ok: true; slots: string[] } | { error: string }> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: 'Pick a valid date.' };
  const profile = await requireRole(['staff', 'admin', 'owner'], '/staff');
  const admin = createAdminClient();
  const { data } = await admin.from('bookings').select(ROW_COLUMNS).eq('id', bookingId).single();
  if (!data) return { error: 'Booking not found.' };
  const booking = data as ActionBookingRow;

  const decision = canStaffReschedule(booking, { role: profile.role, stylistId: profile.stylistId });
  if (!decision.ok) return { error: 'That booking can’t be rescheduled.' };

  const serviceIds = booking.service_ids?.length ? booking.service_ids : [booking.service_id];
  const { slots } = await getAvailability({ serviceIds, stylistId: booking.stylist_id, date });
  return { ok: true, slots };
}

export async function staffRescheduleBooking(
  bookingId: string,
  date: string,
  time: string,
): Promise<{ ok: true; startsAt: string; endsAt: string } | { error: string }> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    return { error: 'Pick a valid date and time.' };
  }
  const profile = await requireRole(['staff', 'admin', 'owner'], '/staff');
  const admin = createAdminClient();
  const { data } = await admin.from('bookings').select(ROW_COLUMNS).eq('id', bookingId).single();
  if (!data) return { error: 'Booking not found.' };
  const booking = data as ActionBookingRow;

  const decision = canStaffReschedule(booking, { role: profile.role, stylistId: profile.stylistId });
  if (!decision.ok) {
    return { error: decision.reason === 'not_your_chair' ? 'That booking isn’t on your chair.' : 'Only confirmed bookings can be moved.' };
  }

  // Re-derive the combined duration from the DB (multi-service bookings sum all
  // services; legacy rows have service_ids = null → fall back to service_id).
  const serviceIds = booking.service_ids?.length ? booking.service_ids : [booking.service_id];
  const { data: rows } = await admin.from('services').select('duration_min').in('id', serviceIds);
  if (!rows || rows.length === 0) return { error: 'That service is unavailable.' };
  const durationMin = rows.reduce((sum, r) => sum + r.duration_min, 0);

  // The new time must be a currently-open slot for the same stylist — reuses
  // all of getAvailability's guards. The DB EXCLUDE constraint is the race guard.
  const { slots } = await getAvailability({ serviceIds, stylistId: booking.stylist_id, date });
  if (!slots.includes(time)) return { error: 'That time isn’t available — pick another slot.' };

  const [h, mi] = time.split(':').map(Number);
  const startMin = h! * 60 + mi!;
  const startsAt = toUtcInstant(date, startMin, TZ);
  const endsAt = toUtcInstant(date, startMin + durationMin, TZ);

  const { error } = await admin.from('bookings').update({ starts_at: startsAt, ends_at: endsAt }).eq('id', bookingId);
  if (error) {
    if (error.code === '23P01') return { error: 'That time was just taken — pick another.' };
    return { error: 'Could not reschedule. Please try again.' };
  }
  try { await notifyBookingRescheduled(await buildBookingChange(booking, startsAt)); }
  catch (err) { console.error('[notify] staff reschedule notification failed:', err); }
  revalidateStaff();
  return { ok: true, startsAt, endsAt };
}
