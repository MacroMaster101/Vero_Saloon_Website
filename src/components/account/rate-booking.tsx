'use client';
import { useState, useTransition } from 'react';
import { submitReview } from '@/app/account/review-actions';

// Inline rating panel for a completed booking: 1–5 stars + optional comment.
export function RateBooking({
  bookingId,
  onClose,
  onDone,
}: {
  bookingId: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, start] = useTransition();

  function submit() {
    if (stars < 1) {
      setError('Pick a star rating first.');
      return;
    }
    setError(null);
    start(async () => {
      const res = await submitReview({ bookingId, rating: stars, comment });
      if (res.ok) onDone();
      else setError(res.message);
    });
  }

  const shown = hover || stars;
  return (
    <div className="rate" style={{ flexBasis: '100%' }}>
      <div className="rate__stars" role="radiogroup" aria-label="Star rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={`rate__star${n <= shown ? ' on' : ''}`}
            aria-label={`${n} star${n === 1 ? '' : 's'}`}
            aria-pressed={n === stars}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setStars(n)}
          >
            {n <= shown ? '★' : '☆'}
          </button>
        ))}
      </div>
      <textarea
        className="rate__comment"
        placeholder="Add a comment (optional)"
        maxLength={500}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      {error && <p className="step__hint" style={{ color: 'var(--error)' }}>{error}</p>}
      <div className="rate__actions">
        <button type="button" className="btn btn--ghost" onClick={onClose} disabled={busy}>Cancel</button>
        <button type="button" className="btn btn--primary" onClick={submit} disabled={busy}>
          {busy ? 'Submitting…' : 'Submit review'}
        </button>
      </div>
    </div>
  );
}
