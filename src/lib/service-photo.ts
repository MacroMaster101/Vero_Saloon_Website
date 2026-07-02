// Resolves the image for a service:
//   1. the admin-uploaded photo (image_url) if present — always wins;
//   2. otherwise a per-slug match from SLUG_PHOTO (bundled photos that fit
//      that exact service — service + lookbook images are shared here);
//   3. otherwise a keyword-matched category photo from the 5 bundled defaults
//      (bridal, beard, colour, facial, hair).
// `fallbackSrc` is the category default so any broken/missing image degrades to
// the *right* category picture (not a generic one) via the card's onError.
//
// To give a service its own distinct picture: upload one in Admin → Services
// (sets image_url), or drop a photo in /public and add its path to SLUG_PHOTO.
// Only list files that actually exist so cards never flicker through a broken
// image for services without a dedicated photo.
import type { Service } from '@/lib/supabase/types';

type PhotoInput = Pick<Service, 'image_url' | 'category' | 'slug' | 'name' | 'icon'>;
type Photo =
  | { type: 'img'; src: string; fallbackSrc?: string }
  | { type: 'icon' };

const DIR = '/images/services';
const LOOK = '/images/lookbook';

// Slug → bundled photo that matches that service's title. Every current menu
// slug is covered; new services without an entry (or an admin upload) fall
// through to the category default.
const SLUG_PHOTO: Record<string, string> = {
  'gents-cut':    `${LOOK}/gents-fade.png`,      // sharp gents cut, barber chair
  'ladies-cut':   `${LOOK}/ladies-colour.png`,   // long styled waves, blow-dry finish
  'colour-roots': `${DIR}/colour.png`,           // foil colour application
  'colour-full':  `${DIR}/colour-full.png`,      // full hair colour transformation
  'hair-spa':     `${LOOK}/hair-spa.png`,        // wash-basin treatment
  'kids-cut':     `${DIR}/kids-cut.png`,         // kids cut in salon chair
  'beard':        `${LOOK}/beard-grooming.png`,  // clipper beard trim
  'facial':       `${DIR}/facial.png`,           // facial treatment
  'threading':    `${LOOK}/facial-glow.png`,     // brow/face treatment
  'waxing':       `${DIR}/waxing.png`,           // arm/body waxing treatment
  'mani-pedi':    `${DIR}/mani-pedi.png`,        // manicure & pedicure session
  'bridal':       `${LOOK}/bridal-look.png`,     // finished bridal look
};

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
  const dedicated = s.slug ? SLUG_PHOTO[s.slug] : undefined;
  if (dedicated) return { type: 'img', src: dedicated, fallbackSrc: category };
  return { type: 'img', src: category };
}
