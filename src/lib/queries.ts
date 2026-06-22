import { createClient } from '@/lib/supabase/server';
import type { Service, Stylist, GalleryItem, BusinessHour } from '@/lib/supabase/types';

// Robust local fallback datasets for unseeded database setups
const FALLBACK_SERVICES: Service[] = [
  { id: 'd1b9134a-9e1e-4cb2-a72a-6ffebde76b4a', slug: 'gents-cut', name: 'Gents Cut & Style', description: 'Wash, cut & finish.', category: 'hair', price_lkr: 900, duration_min: 40, icon: 'scissors', bookable: true, sort_order: 1, is_active: true },
  { id: 'a5c0b8de-28e4-44df-be9d-5eb270a4421b', slug: 'ladies-cut', name: 'Ladies Cut & Blow-dry', description: 'Cut, wash & styled finish.', category: 'hair', price_lkr: 1500, duration_min: 60, icon: 'scissors', bookable: true, sort_order: 2, is_active: true },
  { id: '7aefbcf4-6fb0-4560-8451-f761bb8a4d2f', slug: 'colour-roots', name: 'Hair Colour (roots)', description: 'Single-shade touch-up.', category: 'hair', price_lkr: 3500, duration_min: 90, icon: 'color', bookable: true, sort_order: 3, is_active: true },
  { id: '3b90f4fa-d07f-4c54-8c81-80e9a1170d10', slug: 'colour-full', name: 'Full Hair Colour', description: 'Root to tip, your shade.', category: 'hair', price_lkr: 6000, duration_min: 120, icon: 'color', bookable: true, sort_order: 4, is_active: true },
  { id: 'c5a3d7d1-e6e2-45e0-8ad4-1c881c1c1f51', slug: 'hair-spa', name: 'Hair Treatment & Spa', description: 'Deep conditioning repair.', category: 'hair', price_lkr: 2500, duration_min: 45, icon: 'beauty', bookable: true, sort_order: 5, is_active: true },
  { id: 'c78b88d8-7967-4fb7-85ef-9689f92945d8', slug: 'kids-cut', name: 'Kids\' Cut (under 12)', description: 'Quick, gentle & patient.', category: 'hair', price_lkr: 600, duration_min: 25, icon: 'scissors', bookable: true, sort_order: 6, is_active: true },
  { id: '24a2a6b2-6014-4361-9c60-8d591b61b58a', slug: 'beard', name: 'Beard Grooming', description: 'Trim, shape & finish.', category: 'beauty', price_lkr: 500, duration_min: 25, icon: 'razor', bookable: true, sort_order: 7, is_active: true },
  { id: 'ea4a07d7-27b3-4f9e-990c-03d3f9b2d8d8', slug: 'facial', name: 'Clean-up & Facial', description: 'Glow facial, him or her.', category: 'beauty', price_lkr: 2500, duration_min: 50, icon: 'beauty', bookable: true, sort_order: 8, is_active: true },
  { id: '96d115e5-7977-4475-ba7e-726071d2b860', slug: 'threading', name: 'Threading (brow / face)', description: 'Quick & precise.', category: 'beauty', price_lkr: 200, duration_min: 15, icon: 'beauty', bookable: true, sort_order: 9, is_active: true },
  { id: 'e685f400-0df2-4752-bf6d-8fb4fa7db38f', slug: 'waxing', name: 'Waxing (full arm)', description: 'Smooth, clean finish.', category: 'beauty', price_lkr: 900, duration_min: 30, icon: 'beauty', bookable: true, sort_order: 10, is_active: true },
  { id: 'be8d2038-f1c5-43fb-9806-25f0a20a4be3', slug: 'mani-pedi', name: 'Manicure & Pedicure', description: 'Hands & feet, together.', category: 'beauty', price_lkr: 2800, duration_min: 75, icon: 'beauty', bookable: true, sort_order: 11, is_active: true },
  { id: '41f71d18-8f8d-4cb0-a548-db5f86e30bde', slug: 'bridal', name: 'Bridal Package', description: 'Hair, make-up & dressing.', category: 'beauty', price_lkr: 15000, duration_min: 180, icon: 'star', bookable: true, sort_order: 12, is_active: true }
];

const FALLBACK_STYLISTS: Stylist[] = [
  { id: '2bc8040d-b4b0-449e-b197-d86c757c9632', slug: 'ruwan', name: 'Ruwan', role: 'Gents Stylist', tags: ['Cuts', 'Colour'], avatar_url: '/images/stylists/ruwan.png', rating: null, rating_count: 0, sort_order: 1, is_active: true },
  { id: '737ef753-4ff7-44c1-90a6-d24249a46452', slug: 'sanduni', name: 'Sanduni', role: 'Ladies Stylist', tags: ['Cut & style', 'Blow-dry'], avatar_url: '/images/stylists/sanduni.png', rating: null, rating_count: 0, sort_order: 2, is_active: true },
  { id: 'e90899f5-ccfa-496a-932d-949479b4a49c', slug: 'tharindu', name: 'Tharindu', role: 'Barber', tags: ['Beard', 'Fades'], avatar_url: '/images/stylists/tharindu.png', rating: null, rating_count: 0, sort_order: 3, is_active: true },
  { id: 'c234a749-e314-4eb7-a720-bdc71ebf1074', slug: 'nadeesha', name: 'Nadeesha', role: 'Beauty Therapist', tags: ['Facials', 'Bridal'], avatar_url: '/images/stylists/nadeesha.png', rating: null, rating_count: 0, sort_order: 4, is_active: true }
];

const FALLBACK_GALLERY: GalleryItem[] = [
  { id: '7e8d2e8b-b8c7-43cf-bc01-e2be67d26456', title: 'Ladies Colour', tag: 'Colour', category: 'Balayage, roots & full shades', image_url: '/images/lookbook/ladies-colour.png', sort_order: 1, is_active: true },
  { id: '4cfa0d7a-7bd8-498c-8f3b-fa1516e81404', title: 'Gents Fade', tag: 'Gents', category: 'Sharp, blended & clean', image_url: '/images/lookbook/gents-fade.png', sort_order: 2, is_active: true },
  { id: '2d8f99e3-36c1-4b1f-aa35-649033333333', title: 'Bridal Look', tag: 'Bridal', category: 'Hair, make-up & dressing', image_url: '/images/lookbook/bridal-look.png', sort_order: 3, is_active: true },
  { id: '8ba9321e-c0fa-4d1a-a1db-043e7bb0e9b9', title: 'Hair Treatment', tag: 'Hair Spa', category: 'Repair, smooth & shine', image_url: '/images/lookbook/hair-spa.png', sort_order: 4, is_active: true },
  { id: 'f0cf0b61-419b-4cd3-8947-0e6fb1bf679e', title: 'Beard Grooming', tag: 'Beard', category: 'Shaped, lined & oiled', image_url: '/images/lookbook/beard-grooming.png', sort_order: 5, is_active: true },
  { id: 'f8adcf91-1fa1-41c3-bb52-f67ebf1d248b', title: 'Facial & Glow', tag: 'Beauty', category: 'Clean-ups & facials', image_url: '/images/lookbook/facial-glow.png', sort_order: 6, is_active: true }
];

const FALLBACK_HOURS: BusinessHour[] = [
  { day_of_week: 0, open_minute: 600, close_minute: 1440, is_closed: false },
  { day_of_week: 1, open_minute: 600, close_minute: 1440, is_closed: false },
  { day_of_week: 2, open_minute: 600, close_minute: 1440, is_closed: false },
  { day_of_week: 3, open_minute: 600, close_minute: 1440, is_closed: false },
  { day_of_week: 4, open_minute: 600, close_minute: 1440, is_closed: false },
  { day_of_week: 5, open_minute: 600, close_minute: 1440, is_closed: false },
  { day_of_week: 6, open_minute: 600, close_minute: 1440, is_closed: false }
];

export async function getServices() {
  const sb = await createClient();
  const { data } = await sb.from('services').select('*').eq('is_active', true).order('sort_order');
  return data && data.length > 0 ? data : FALLBACK_SERVICES;
}

export async function getBookableServices() {
  const sb = await createClient();
  const { data } = await sb.from('services').select('*').eq('is_active', true).eq('bookable', true).order('sort_order');
  return data && data.length > 0 ? data : FALLBACK_SERVICES.filter((s) => s.bookable);
}

export async function getStylists() {
  const sb = await createClient();
  const { data } = await sb.from('stylists').select('*').eq('is_active', true).order('sort_order');
  return data && data.length > 0 ? data : FALLBACK_STYLISTS;
}

export async function getGallery() {
  const sb = await createClient();
  const { data } = await sb.from('gallery').select('*').eq('is_active', true).order('sort_order');
  return data && data.length > 0 ? data : FALLBACK_GALLERY;
}

export async function getBusinessHours() {
  const sb = await createClient();
  const { data } = await sb.from('business_hours').select('*').order('day_of_week');
  return data && data.length > 0 ? data : FALLBACK_HOURS;
}

// A safe email contains no PostgREST filter metacharacters or ilike wildcards.
// The email comes from the verified auth session, but we still refuse to
// interpolate anything that could break out of the .or() clause (defense in
// depth against filter injection) — comma/paren are PostgREST separators,
// %/_ are ilike wildcards, : guards against operator tokens.
function isSafeEmailForFilter(email: string): boolean {
  return /^[^,()%_:\s]+@[^,()%_:\s]+$/.test(email);
}

// Builds a PostgREST `.or()` filter string for a user's booking history:
// their own (user_id) plus legacy guest bookings matching their verified email.
export function historyOrFilter(userId: string, email: string | null): string {
  const own = `user_id.eq.${userId}`;
  if (!email || !isSafeEmailForFilter(email)) return own;
  return `${own},and(user_id.is.null,customer_email.ilike.${email.toLowerCase()})`;
}

export async function getMyBookings(userId: string, email: string | null) {
  const sb = await createClient();
  const { data } = await sb
    .from('bookings')
    .select('id, reference, starts_at, ends_at, status, customer_name, service_id, stylist_id')
    .or(historyOrFilter(userId, email))
    .order('starts_at', { ascending: false });
  return data ?? [];
}
