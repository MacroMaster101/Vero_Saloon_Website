import { dicebearUrl } from '@/lib/avatar';

// Uploaded/seeded avatar wins; otherwise a stable DiceBear avatar seeded by the
// stylist's slug (or name), so every stylist gets a friendly default image.
export function stylistAvatarSrc(stylist: {
  slug: string;
  name: string;
  avatar_url: string | null;
}): string {
  const url = (stylist.avatar_url ?? '').trim();
  return url !== '' ? url : dicebearUrl(stylist.slug || stylist.name);
}

// "★ 4.9" + "(42 reviews)" when rated; "★ New" otherwise. Ratings come from a
// future reviews system; until then stylists are unrated (null rating / 0
// count) and render as New. `rating == null` also covers `undefined`, so the
// card renders correctly even before the rating columns exist in the DB.
export function ratingLabel(
  rating: number | null,
  count: number,
): { stars: string; reviews: string | null } {
  if (rating != null && count > 0) {
    return { stars: `★ ${Number(rating).toFixed(1)}`, reviews: `(${count} review${count === 1 ? '' : 's'})` };
  }
  return { stars: '★ New', reviews: null };
}
