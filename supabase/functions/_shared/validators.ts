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

// Accepts multi-service `serviceIds[]` (preferred) OR a single legacy
// `serviceId` (older clients). At least one service id is required. `normalizeServiceIds`
// collapses either form to a deduped array.
export const createBookingSchema = bookingDetailsSchema.extend({
  serviceIds: z.array(z.string().uuid()).min(1).max(10).optional(),
  serviceId: z.string().uuid().optional(),
  stylistId: z.string().uuid().nullable(), // null = no preference
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
}).refine((v) => (v.serviceIds && v.serviceIds.length > 0) || v.serviceId, {
  message: 'Pick at least one service',
  path: ['serviceIds'],
});
export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export function normalizeServiceIds(input: { serviceIds?: string[]; serviceId?: string }): string[] {
  const ids = input.serviceIds && input.serviceIds.length > 0 ? input.serviceIds : (input.serviceId ? [input.serviceId] : []);
  return Array.from(new Set(ids));
}
