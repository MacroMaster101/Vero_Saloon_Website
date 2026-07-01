// Resolves the image for a service:
//   1. the admin-uploaded photo (image_url) if present — always wins;
//   2. otherwise a keyword-matched category photo from the 5 bundled defaults
//      (bridal, beard, colour, facial, hair).
// `fallbackSrc` is the category default so any broken/missing image degrades to
// the *right* category picture (not a generic one) via the card's onError.
//
// To give a service its own distinct picture: upload one in Admin → Services
// (sets image_url), or add a per-slug file and switch the primary below. We
// serve the category image directly (not a per-slug guess) so cards never
// flicker through a broken image for services without a dedicated photo.
import type { Service } from '@/lib/supabase/types';

type PhotoInput = Pick<Service, 'image_url' | 'category' | 'slug' | 'name' | 'icon'>;
type Photo =
  | { type: 'img'; src: string; fallbackSrc?: string }
  | { type: 'icon' };

const DIR = '/images/services';

// Which of the 5 bundled category images best fits this service's title.
function categoryFile(s: PhotoInput): string {
  const hay = `${s.slug ?? ''} ${s.name ?? ''} ${s.icon ?? ''}`.toLowerCase();
  const has = (...keys: string[]) => keys.some((k) => hay.includes(k));
  if (has('bridal', 'wedding', 'makeup', 'make-up')) return 'bridal';
  if (has('beard', 'shave', 'razor', 'moustache')) return 'beard';
  if (has('colour', 'color', 'balayage', 'highlight', 'tint', 'dye')) return 'colour';
  // beauty treatments (facials, threading, waxing, mani/pedi, clean-up) → facial
  if (has('facial', 'skin', 'glow', 'thread', 'wax', 'mani', 'pedi', 'nail', 'clean')) return 'facial';
  // everything hair-side (cuts, styling, blow-dry, spa, kids, treatment) → hair
  if (has('cut', 'style', 'blow', 'spa', 'treatment', 'kid', 'trim', 'hair')) return 'hair';
  return s.category === 'beauty' ? 'facial' : 'hair';
}

export function servicePhoto(s: PhotoInput): Photo {
  const category = `${DIR}/${categoryFile(s)}.png`;
  if (typeof s.image_url === 'string' && s.image_url.trim() !== '') {
    return { type: 'img', src: s.image_url, fallbackSrc: category };
  }
  return { type: 'img', src: category };
}
