'use client';
import { useState, useTransition } from 'react';
import { StarRow } from '@/components/reviews/star-row';
import { deleteReview } from './actions';

export type AdminReview = {
  id: string;
  stylistName: string;
  customer_name: string;
  rating: number;
  comment: string;
  likes_count: number;
  reports_count: number;
  created_at: string;
};

const dateFmt = new Intl.DateTimeFormat('en-LK', { day: 'numeric', month: 'short', year: 'numeric' });

export function ReviewsList({ reviews }: { reviews: AdminReview[] }) {
  const [items, setItems] = useState<AdminReview[]>(reviews);
  const [error, setError] = useState<string | null>(null);
  const [busy, start] = useTransition();

  function remove(r: AdminReview) {
    if (!window.confirm(`Delete this review by ${r.customer_name}? This recomputes ${r.stylistName}'s rating.`)) return;
    setError(null);
    start(async () => {
      const res = await deleteReview(r.id);
      if ('ok' in res) setItems((list) => list.filter((x) => x.id !== r.id));
      else setError(res.error);
    });
  }

  if (items.length === 0) return <p className="step__hint">No reviews yet.</p>;

  return (
    <div>
      {error && <p className="step__hint" style={{ color: 'var(--error)' }}>{error}</p>}
      <ul className="review-list" style={{ maxWidth: 640 }}>
        {items.map((r) => (
          <li key={r.id} className="review" style={r.reports_count > 0 ? { borderColor: 'var(--error)' } : undefined}>
            <div className="review__head">
              <b className="review__name">{r.customer_name} · <span style={{ color: 'var(--accent-text)' }}>{r.stylistName}</span></b>
              <StarRow rating={r.rating} />
            </div>
            {!!r.comment && <p className="review__comment">{r.comment}</p>}
            <div className="review__foot">
              <span className="review__date">{dateFmt.format(new Date(r.created_at))} · ♥ {r.likes_count}</span>
              {r.reports_count > 0 && (
                <span style={{ color: 'var(--error)', fontWeight: 700 }}>
                  {r.reports_count} report{r.reports_count === 1 ? '' : 's'}
                </span>
              )}
              <button type="button" className="btn btn--ghost" disabled={busy} onClick={() => remove(r)} style={{ marginLeft: 'auto', fontSize: 12, padding: '4px 10px' }}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
