import { z } from 'zod';
import { slugify } from './service-schema';

export const stylistInputSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),
    slug: z.string().trim().default(''),
    role: z.string().trim().default(''),
    tags: z.string().default(''),
    avatar_url: z.string().trim().default(''),
    sort_order: z.coerce.number().int().default(0),
    is_active: z.coerce.boolean().default(true),
  })
  .transform((v) => ({
    name: v.name,
    slug: v.slug ? slugify(v.slug) : slugify(v.name),
    role: v.role,
    tags: v.tags.split(',').map((t) => t.trim()).filter(Boolean),
    avatar_url: v.avatar_url === '' ? null : v.avatar_url,
    sort_order: v.sort_order,
    is_active: v.is_active,
  }));

export type StylistInput = z.infer<typeof stylistInputSchema>;
