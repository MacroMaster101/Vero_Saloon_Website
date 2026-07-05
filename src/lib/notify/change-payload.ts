import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import type { BookingChange } from './types';

// Shared builder for customer cancel/reschedule notifications, used by both the
// account (customer) and staff booking actions. Best-effort: the caller wraps
// notify sends in try/catch so a failure here never blocks the mutation.

const TZ = 'Asia/Colombo';
export const whenFmt = new Intl.DateTimeFormat('en-LK', {
  timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short',
  hour: 'numeric', minute: '2-digit', hour12: true,
});

// The minimal booking shape both callers already satisfy (their fuller row
// types are structurally compatible).
export type NotifiableBooking = {
  reference: string;
  starts_at: string;
  service_id: string;
  service_ids: string[] | null;
  stylist_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
};

export async function buildBookingChange(
  booking: NotifiableBooking,
  newStartsAt?: string,
): Promise<BookingChange> {
  const admin = createAdminClient();
  const serviceIds = booking.service_ids?.length ? booking.service_ids : [booking.service_id];
  const [{ data: services }, { data: stylist }] = await Promise.all([
    admin.from('services').select('name').in('id', serviceIds),
    booking.stylist_id
      ? admin.from('stylists').select('name').eq('id', booking.stylist_id).single()
      : Promise.resolve({ data: null }),
  ]);
  return {
    reference: booking.reference,
    customerName: booking.customer_name,
    customerEmail: booking.customer_email,
    customerPhone: booking.customer_phone,
    serviceName: (services ?? []).map((s) => s.name).join(', ') || 'Service',
    stylistName: stylist?.name ?? 'Any stylist',
    whenLabel: whenFmt.format(new Date(booking.starts_at)),
    newWhenLabel: newStartsAt ? whenFmt.format(new Date(newStartsAt)) : undefined,
  };
}
