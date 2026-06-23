import type { ReviewWithStylist } from '@/lib/queries';
import { StarRow } from '@/components/reviews/star-row';

const dateFmt = new Intl.DateTimeFormat('en-LK', { day: 'numeric', month: 'short', year: 'numeric' });

export function ReviewsSection({ reviews }: { reviews: ReviewWithStylist[] }) {
  if (reviews.length === 0) return null;
  return (
    <section className="section reviews-section" id="reviews">
      <div className="wrap">
        <div className="sec-head reveal" style={{ marginBottom: 28 }}>
          <div>
            <span className="eyebrow">Reviews</span>
            <h2 className="h-section">What our clients say</h2>
          </div>
        </div>
        <ul className="rs-grid">
          {reviews.map((r) => (
            <li key={r.id} className="rs-card reveal">
              <StarRow rating={r.rating} />
              {!!r.comment && <p className="rs-card__comment">{r.comment}</p>}
              <div className="rs-card__foot">
                <span className="rs-card__name">{r.customer_name}</span>
                {r.stylist_name && <span className="rs-card__stylist">with {r.stylist_name}</span>}
                <span className="rs-card__date">{dateFmt.format(new Date(r.created_at))}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
