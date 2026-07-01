// Zod schema for the admin business-hours editor (per-day open/close, closed
// flag). Validates admin input server-side before persisting.
import { z } from 'zod';

export const hoursDaySchema = z.object({
  day_of_week: z.coerce.number().int().min(0).max(6),
  open_minute: z.coerce.number().int().min(0).max(1440),
  close_minute: z.coerce.number().int().min(0).max(1440),
  is_closed: z.coerce.boolean().default(false),
});
