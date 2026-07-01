// Shared Zod schemas for user-facing input (booking details, Sri Lankan phone).
// Reused by both client forms and server actions so validation stays in sync.
import { z } from 'zod';

// Sri Lankan mobile: local 0xxxxxxxxx (10 digits) or +94xxxxxxxxx. Spaces allowed.
export const slLankaPhone = z.string().transform((s) => s.replace(/[\s-]/g, '')).pipe(
  z.string().regex(/^(?:\+94|0)\d{9}$/, 'Enter a valid Sri Lankan mobile number'),
);

export const bookingDetailsSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name'),
  phone: slLankaPhone,
  email: z.string().trim().min(1, 'Please enter your email').email('That email doesn’t look right'),
  notes: z.string().max(500).default(''),
});
export type BookingDetails = z.infer<typeof bookingDetailsSchema>;

export const createBookingSchema = bookingDetailsSchema.extend({
  // One or more services booked as a single combined visit. The first entry is
  // the "primary" service (stored in bookings.service_id); the full list goes to
  // bookings.service_ids. Deduped + capped to keep the combined block sane.
  serviceIds: z.array(z.string().uuid()).min(1, 'Pick at least one service').max(10),
  stylistId: z.string().uuid().nullable(), // null = no preference
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
});
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
