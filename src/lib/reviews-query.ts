import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';
import type { Review } from '@/components/reviews/review-list';

// Single source of the public review column list (used by both server and
// browser callers) so the two surfaces never drift.
export const REVIEW_COLUMNS = 'id, customer_name, rating, comment, likes_count, created_at';

/**
 * Public reviews for one stylist, newest first. Accepts a Supabase client so it
 * works from a client component (browser client) or the server. Returns [] on error.
 */
export async function getStylistReviews(
  client: SupabaseClient<Database>,
  stylistId: string,
): Promise<Review[]> {
  const { data, error } = await client
    .from('stylist_reviews')
    .select(REVIEW_COLUMNS)
    .eq('stylist_id', stylistId)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as unknown as Review[];
}
