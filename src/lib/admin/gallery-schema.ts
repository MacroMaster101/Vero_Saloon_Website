// Zod schema for the admin gallery (lookbook) item form. Server-side validation
// of admin input before persisting.
import { z } from 'zod';

export const galleryInputSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  tag: z.string().trim().default(''),
  category: z.string().trim().default(''),
  image_url: z.string().trim().min(1, 'An image is required'),
  sort_order: z.coerce.number().int().default(0),
  is_active: z.coerce.boolean().default(true),
});
