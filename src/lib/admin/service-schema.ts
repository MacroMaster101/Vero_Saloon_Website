import { z } from 'zod';

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const numberFromForm = z.coerce.number();

export const serviceInputSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),
    slug: z.string().trim().default(''),
    description: z.string().trim().max(280).default(''),
    category: z.enum(['hair', 'beauty']),
    price_lkr: numberFromForm.int().min(0, 'Price cannot be negative'),
    duration_min: numberFromForm.int().positive('Duration must be greater than 0'),
    icon: z.string().trim().min(1).default('scissors'),
    image_url: z.string().trim().default(''),
    bookable: z.coerce.boolean().default(true),
    is_active: z.coerce.boolean().default(true),
    is_featured: z.coerce.boolean().default(false),
    sort_order: numberFromForm.int().default(0),
  })
  .transform((v) => ({ ...v, slug: v.slug ? slugify(v.slug) : slugify(v.name) }));

export type ServiceInput = z.infer<typeof serviceInputSchema>;
