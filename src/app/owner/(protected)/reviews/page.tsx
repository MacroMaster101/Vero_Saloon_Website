import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/supabase/auth';
import { ReviewsList, type AdminReview } from '@/app/admin/(protected)/reviews/reviews-list';
import { Icon } from '@/components/ui/icon';

type Row = {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  likes_count: number;
  reports_count: number;
  created_at: string;
  stylists: { name: string } | null;
};

export default async function OwnerReviewsPage() {
  await requireRole(['owner', 'admin'], '/owner/reviews');
  const sb = await createClient();
  const { data } = await sb
    .from('stylist_reviews')
    .select('id, customer_name, rating, comment, likes_count, reports_count, created_at, stylists(name)')
    .order('created_at', { ascending: false });

  const rows = ((data ?? []) as unknown as Row[]).map((r): AdminReview => ({
    id: r.id,
    stylistName: r.stylists?.name ?? 'Unknown stylist',
    customer_name: r.customer_name,
    rating: r.rating,
    comment: r.comment,
    likes_count: r.likes_count,
    reports_count: r.reports_count,
    created_at: r.created_at,
  }));
  // Reported reviews first, then newest.
  rows.sort((a, b) => (b.reports_count - a.reports_count) || (b.created_at.localeCompare(a.created_at)));

  return (
    <div>
      <Link href="/owner" className="oback"><Icon name="arrowLeft" className="ic" /> Home</Link>
      <h1 className="opage__title">Reviews</h1>
      <p className="opage__hint">Reported reviews show first. Deleting one updates the stylist&apos;s rating.</p>
      <ReviewsList reviews={rows} />
    </div>
  );
}
