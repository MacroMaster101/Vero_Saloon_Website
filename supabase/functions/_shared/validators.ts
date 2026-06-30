import { z } from 'npm:zod@4';

// Sri Lankan mobile: local 0xxxxxxxxx (10 digits) or +94xxxxxxxxx. Spaces allowed.
export const slLankaPhone = z.string().transform((s) => s.replace(/[\s-]/g, '')).pipe(
  z.string().regex(/^(?:\+94|0)\d{9}$/, 'Enter a valid Sri Lankan mobile number'),
);

export const bookingDetailsSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name'),
  phone: slLankaPhone,
  email: z.union([z.literal(''), z.string().email('That email doesn’t look right')]),
  notes: z.string().max(500).default(''),
});
export type BookingDetails = z.infer<typeof bookingDetailsSchema>;

export const createBookingSchema = bookingDetailsSchema.extend({
  serviceId: z.string().uuid(),
  stylistId: z.string().uuid().nullable(), // null = no preference
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
});
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
