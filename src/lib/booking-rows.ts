// Booking → display-row mapping shared by the admin dashboard and the owner
// dashboard. Days are bucketed by the salon's local calendar (Asia/Colombo).
import type { Booking } from '@/lib/supabase/types';
import type { BookingRow } from '@/components/admin/bookings-table';

export const SALON_TZ = 'Asia/Colombo';
export type BookingJoinRow = Booking & { services: { name: string } | null; stylists: { name: string } | null };

const dayFmt = new Intl.DateTimeFormat('en-CA', { timeZone: SALON_TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
const whenFmt = new Intl.DateTimeFormat('en-LK', {
  timeZone: SALON_TZ, weekday: 'short', day: 'numeric', month: 'short',
  hour: 'numeric', minute: '2-digit', hour12: true,
});

export function toBookingRow(b: BookingJoinRow): BookingRow {
  return {
    id: b.id,
    reference: b.reference,
    customerName: b.customer_name,
    customerPhone: b.customer_phone,
    serviceName: b.services?.name ?? 'Unknown service',
    stylistName: b.stylists?.name ?? 'Any',
    whenLabel: whenFmt.format(new Date(b.starts_at)),
    status: b.status,
  };
}

export function salonDayKey(d: Date): string {
  return dayFmt.format(d);
}

export function splitTodayUpcoming(rows: BookingJoinRow[], now: Date = new Date()) {
  const todayKey = dayFmt.format(now);
  const today: BookingRow[] = [];
  const upcoming: BookingRow[] = [];
  for (const b of rows) {
    const key = dayFmt.format(new Date(b.starts_at));
    if (key === todayKey) today.push(toBookingRow(b));
    else if (key > todayKey) upcoming.push(toBookingRow(b));
  }
  return { today, upcoming };
}
