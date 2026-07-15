'use client';
import { useState, useTransition } from 'react';
import { submitReview } from '@/app/account/review-actions';
import { t } from '@/lib/i18n/translations';

// Inline rating panel for a completed booking: 1–5 stars + optional comment.
export function RateBooking({
  bookingId,
  onClose,
  onDone,
  locale = 'en',
}: {
  bookingId: string;
  onClose: () => void;
  onDone: () => void;
  locale?: string;
}) {
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, start] = useTransition();

  function submit() {
    if (stars < 1) {
      setError(t('Pick a star rating first.', locale));
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
      <div className="rate__stars" role="radiogroup" aria-label={t('Star rating', locale)}>
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
        placeholder={t('Add a comment (optional)', locale)}
        maxLength={500}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      {error && <p className="step__hint" style={{ color: 'var(--error)' }}>{error}</p>}
      <div className="rate__actions">
        <button type="button" className="btn btn--ghost" onClick={onClose} disabled={busy}>{t('Cancel', locale)}</button>
        <button type="button" className="btn btn--primary" onClick={submit} disabled={busy}>
          {busy ? t('Submitting…', locale) : t('Submit review', locale)}
        </button>
      </div>
    </div>
  );
}
