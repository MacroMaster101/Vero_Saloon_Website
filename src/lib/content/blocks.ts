import { z } from 'zod';

// ── Quote ──────────────────────────────────────────────
export const quoteSchema = z.object({
  stars: z.string().trim().default('★★★★★'),
  text: z.string().trim().default(
    'Friendly staff and a great cut every time. Easily the best salon in Pasyala.',
  ),
  by: z.string().trim().default('Google review · 4.9 ★ average'),
});
export type QuoteContent = z.infer<typeof quoteSchema>;

// ── CTA ────────────────────────────────────────────────
export const ctaSchema = z.object({
  title: z.string().trim().default('Time to treat yourself.'),
  sub: z.string().trim().default(
    "Book a hair, colour or beauty appointment at Vero Salon — for him or her. We're open till midnight, every day.",
  ),
  phoneLabel: z.string().trim().default('Call 077 369 9620'),
  phoneHref: z.string().trim().default('tel:0773699620'),
});
export type CtaContent = z.infer<typeof ctaSchema>;

// ── Story ──────────────────────────────────────────────
export const storySchema = z.object({
  eyebrow: z.string().trim().default('Our Story'),
  heading: z.string().trim().default("Pasyala's unisex hair & beauty home."),
  paragraphs: z.array(z.string()).default([
    'Vero Salon is a friendly neighbourhood salon on Attanagalla Road, Pasyala — a unisex space for hair, colour and beauty, for him and her. We keep it warm, welcoming and unhurried.',
    'Sharp cuts, fresh colour, beard grooming, facials and full bridal — done by a team that takes the time to get you right. The 4.9-star reviews say the rest.',
  ]),
  sign: z.string().trim().default('— The Vero Salon team'),
});
export type StoryContent = z.infer<typeof storySchema>;

// ── Hero ───────────────────────────────────────────────
export const heroSchema = z.object({
  eyebrow: z.string().trim().default('Est. — Pasyala · Sri Lanka'),
  line1: z.string().trim().default('The art of'),
  line2Em: z.string().trim().default('looking'),
  line3: z.string().trim().default('remarkable.'),
  lead: z.string().trim().default(
    'A warm, unisex home for hair, colour and beauty in Pasyala. Considered cuts and friendly care — for him and for her, unhurried.',
  ),
});
export type HeroContent = z.infer<typeof heroSchema>;

// ── Stats ──────────────────────────────────────────────
const statCardSchema = z.object({
  value: z.string().trim().default(''),
  label: z.string().trim().default(''),
});
export const statsSchema = z.object({
  cards: z.array(statCardSchema).default([
    { value: '4.9★', label: 'Google rating' },
    { value: '8', label: 'Five-star reviews' },
    { value: 'Him&Her', label: 'Unisex salon' },
    { value: '10–12', label: 'Open daily' },
  ]),
});
export type StatsContent = z.infer<typeof statsSchema>;

// ── Contact ────────────────────────────────────────────
export const contactSchema = z.object({
  address: z.string().trim().default('Attanagalla Road, Pasyala'),
  plusCode: z.string().trim().default('545H+F6 Pasyala'),
  phonePrimary: z.string().trim().default('077 369 9620'),
  phoneOther: z.string().trim().default('071 094 4410 · 075 095 3004'),
  facebookUrl: z.string().trim().default('https://www.facebook.com/SaloonRV/'),
  footerBlurb: z.string().trim().default(
    'Hair & beauty unisex salon on Attanagalla Road, Pasyala. For him and her.',
  ),
});
export type ContactContent = z.infer<typeof contactSchema>;

// ── Registry ───────────────────────────────────────────
export const blockSchemas = {
  quote: quoteSchema,
  cta: ctaSchema,
  story: storySchema,
  hero: heroSchema,
  stats: statsSchema,
  contact: contactSchema,
} as const;

export type BlockKey = keyof typeof blockSchemas;

export const BLOCK_DEFAULTS = {
  quote: quoteSchema.parse({}),
  cta: ctaSchema.parse({}),
  story: storySchema.parse({}),
  hero: heroSchema.parse({}),
  stats: statsSchema.parse({}),
  contact: contactSchema.parse({}),
} as const;
