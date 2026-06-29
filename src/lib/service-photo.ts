// Resolves the image for a service: the uploaded photo if present, otherwise a
// keyword match against the bundled service photos, else an icon fallback.
import type { Service } from '@/lib/supabase/types';

type PhotoInput = Pick<Service, 'image_url' | 'category' | 'slug' | 'name' | 'icon'>;
type Photo = { type: 'img'; src: string } | { type: 'icon' };

const DIR = '/images/services';

export function servicePhoto(s: PhotoInput): Photo {
  if (typeof s.image_url === 'string' && s.image_url.trim() !== '') {
    return { type: 'img', src: s.image_url };
  }
  const hay = `${s.slug ?? ''} ${s.name ?? ''} ${s.icon ?? ''}`.toLowerCase();
  let file: string;
  if (hay.includes('bridal')) file = 'bridal';
  else if (hay.includes('beard') || hay.includes('shave') || hay.includes('razor')) file = 'beard';
  else if (hay.includes('colour') || hay.includes('color') || hay.includes('balayage') || hay.includes('highlight')) file = 'colour';
  else if (hay.includes('facial') || hay.includes('skin') || hay.includes('glow')) file = 'facial';
  else file = s.category === 'beauty' ? 'facial' : 'hair';
  return { type: 'img', src: `${DIR}/${file}.png` };
}
