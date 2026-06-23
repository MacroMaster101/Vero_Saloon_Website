'use client';
import { useEffect, useState, type JSX } from 'react';
import type { Stylist } from '@/lib/supabase/types';
import { getFallbackImage } from './img-slot';
import { createClient } from '@/lib/supabase/client';
import { getStylistReviews } from '@/lib/reviews-query';
import { ReviewList, type Review } from '@/components/reviews/review-list';

export function StylistModal({
  stylist, onClose, bookHref,
}: { stylist: Stylist | null; onClose: () => void; bookHref: string }): JSX.Element | null {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    if (!stylist) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [stylist, onClose]);

  // Fetch this stylist's reviews when the modal opens; ignore stale responses.
  const stylistId = stylist?.id ?? null;
  useEffect(() => {
    if (!stylistId) return;
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset + loading flag on open, like booking-wizard/guest-recent
    setLoadingReviews(true);
    setReviews([]);
    getStylistReviews(createClient(), stylistId)
      .then((rows) => { if (active) setReviews(rows); })
      .finally(() => { if (active) setLoadingReviews(false); });
    return () => { active = false; };
  }, [stylistId]);

  if (!stylist) return null;
  const img = getFallbackImage(stylist.avatar_url, stylist.name) ?? '';
  const tags = stylist.tags ?? [];

  return (
    <div className="smodal" role="dialog" aria-modal="true" aria-label={stylist.name} onClick={onClose}>
      <div className="smodal__card" onClick={(e) => e.stopPropagation()}>
        <div className="smodal__cover">
          {img
            ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="smodal__img" src={img} alt={stylist.name} />
              )
            : <div className="smodal__img smodal__img--empty" aria-hidden="true" />}
          <button type="button" className="smodal__x" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="smodal__body">
          <div className="smodal__head">
            <div>
              <h3 className="smodal__name">{stylist.name}</h3>
              {stylist.role && <p className="smodal__role">{stylist.role}</p>}
            </div>
            {stylist.rating != null && stylist.rating_count
              ? <span className="smodal__rating">★ {Number(stylist.rating).toFixed(1)}</span>
              : <span className="smodal__rating">New</span>}
          </div>
          {tags.length > 0 && (
            <div className="smodal__tags">
              {tags.slice(0, 4).map((t) => <span key={t} className="smodal__tag">{t}</span>)}
            </div>
          )}
          <a className="btn btn--primary smodal__book" href={bookHref} onClick={onClose}>Book appointment</a>

          <div className="smodal__reviews">
            {loadingReviews
              ? <p className="smodal__reviews-empty">Loading reviews…</p>
              : reviews.length > 0
                ? <ReviewList reviews={reviews} />
                : <p className="smodal__reviews-empty">No reviews yet — be the first after your visit.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
