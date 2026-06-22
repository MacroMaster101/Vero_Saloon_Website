// Pure review/rating helpers. The DB trigger is authoritative for the persisted
// aggregate; these mirror its rules for optimistic UI and are unit-tested.

// Coerce any input to an integer star value in 1..5.
export function clampStars(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.min(5, Math.max(1, Math.round(n)));
}

// '★★★☆☆' for display; clamps to 0..5 filled stars.
export function starString(rating: number): string {
  const filled = Math.min(5, Math.max(0, Math.round(Number.isFinite(rating) ? rating : 0)));
  return '★'.repeat(filled) + '☆'.repeat(5 - filled);
}

// Running average after adding one new review. A stylist with no prior rating is
// treated as a genuine 0/0 so the first review lands at its true value (the
// "New" display state must not seed the math).
export function computeUpdatedRating(
  prev: { rating: number | null; rating_count: number },
  stars: number,
): { rating: number; rating_count: number } {
  const prevCount = prev.rating_count ?? 0;
  const prevRating = prev.rating ?? 0;
  const safe = clampStars(stars);
  const rating_count = prevCount + 1;
  const rating = Number(((prevRating * prevCount + safe) / rating_count).toFixed(2));
  return { rating, rating_count };
}

// Running average after removing one review. When the last review is removed the
// stylist reverts to unrated (rating null, count 0 → "New").
export function computeRemovedRating(
  prev: { rating: number | null; rating_count: number },
  removedStars: number,
): { rating: number | null; rating_count: number } {
  const prevCount = prev.rating_count ?? 0;
  const prevRating = prev.rating ?? 0;
  const rating_count = Math.max(0, prevCount - 1);
  if (rating_count === 0) return { rating: null, rating_count: 0 };
  const safe = clampStars(removedStars);
  const rating = Number(((prevRating * prevCount - safe) / rating_count).toFixed(2));
  return { rating, rating_count };
}
