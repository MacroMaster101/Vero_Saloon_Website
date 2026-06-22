'use server';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { getUser } from '@/lib/supabase/auth';
import { clampStars, computeUpdatedRating } from '@/lib/reviews';

type Ok = { ok: true };
type Err = { ok: false; message: string };

// A customer may review only their OWN COMPLETED booking. Ownership/state is
// verified in code. The stylist aggregate is recomputed APP-SIDE (read current
// rating → computeUpdatedRating → write back), matching the mobile app that
// shares this database — there is no DB trigger, so both apps use one mechanism.
export async function submitReview(input: {
  bookingId: string;
  rating: number;
  comment: string;
}): Promise<Ok | Err> {
  const user = await getUser();
  if (!user) return { ok: false, message: 'Please sign in.' };

  const admin = createAdminClient();
  const { data: booking } = await admin
    .from('bookings')
    .select('id, user_id, status, stylist_id, customer_name')
    .eq('id', input.bookingId)
    .single();

  if (!booking) return { ok: false, message: 'Booking not found.' };
  if (booking.user_id !== user.id) return { ok: false, message: 'You can only review your own visits.' };
  if (booking.status !== 'completed') return { ok: false, message: 'You can review a visit once it’s completed.' };
  if (!booking.stylist_id) return { ok: false, message: 'This visit has no stylist to review.' };

  const stars = clampStars(input.rating);

  const { error: insertError } = await admin.from('stylist_reviews').insert({
    stylist_id: booking.stylist_id,
    customer_name: booking.customer_name,
    rating: stars,
    comment: (input.comment ?? '').slice(0, 500),
  });
  if (insertError) return { ok: false, message: 'Could not submit your review. Please try again.' };

  // Recompute the stylist's running average (app-side, like the mobile app).
  const { data: stylist } = await admin.from('stylists')
    .select('rating, rating_count').eq('id', booking.stylist_id).single();
  if (stylist) {
    const next = computeUpdatedRating(
      { rating: stylist.rating != null ? Number(stylist.rating) : null, rating_count: stylist.rating_count },
      stars,
    );
    await admin.from('stylists')
      .update({ rating: next.rating, rating_count: next.rating_count })
      .eq('id', booking.stylist_id);
  }

  revalidatePath('/account');
  return { ok: true };
}
