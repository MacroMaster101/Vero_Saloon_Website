import { starString } from '@/lib/reviews';

// Filled/empty 5-star row used across review lists.
export function StarRow({ rating }: { rating: number }) {
  return (
    <span className="star-row" aria-label={`${Math.round(rating)} out of 5 stars`}>
      {starString(rating)}
    </span>
  );
}
