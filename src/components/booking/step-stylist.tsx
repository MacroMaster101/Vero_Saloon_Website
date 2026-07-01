'use client';
import type { Stylist } from '@/lib/supabase/types';
import { stylistAvatarSrc, ratingLabel } from '@/lib/stylist-card';

export function StepStylist({
  stylists,
  selectedId,
  touched,
  onSelect,
}: {
  stylists: Stylist[];
  selectedId: string | null;
  touched: boolean;
  /** id === null → "No preference" */
  onSelect: (id: string | null) => void;
}) {
  const noPref = touched && selectedId === null;
  return (
    <div className="step active" data-step="1">
      <h3 className="step__title">Who&apos;s styling you?</h3>
      <p className="step__hint">Pick your stylist — or let us match you with whoever&apos;s free.</p>
      <div className="choices choices--2 stylist-grid" id="barberList">
        {/* "Any stylist" leads the grid as a clear, first-class option so the
            auto-assign path is obvious and consistent with the stylist cards. */}
        <button
          type="button"
          className={`choice stylist-card stylist-card--rich stylist-card--any${noPref ? ' sel' : ''}`}
          onClick={() => onSelect(null)}
          aria-pressed={noPref}
        >
          <span className="stylist-card__check" aria-hidden="true">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <span className="stylist-card__top">
            <span className="stylist-card__av stylist-card__av--any" aria-hidden="true">✦</span>
            <span className="stylist-card__head">
              <b>Any stylist</b>
              <small>First available</small>
              <span className="stylist-card__rating is-new">Soonest slots</span>
            </span>
          </span>
          <span className="stylist-card__tags stylist-card__tags--any">
            <span className="stylist-card__tag">Fastest booking</span>
          </span>
        </button>
        {stylists.map((st) => {
          const sel = touched && selectedId === st.id;
          const rating = ratingLabel(st.rating, st.rating_count);
          const rated = Boolean(rating.reviews);
          const tags = (st.tags ?? []).slice(0, 3);
          return (
            <button
              type="button"
              key={st.id}
              className={`choice stylist-card stylist-card--rich${sel ? ' sel' : ''}`}
              onClick={() => onSelect(st.id)}
              aria-pressed={sel}
            >
              <span className="stylist-card__check" aria-hidden="true">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span className="stylist-card__top">
                {/* eslint-disable-next-line @next/next/no-img-element -- remote DiceBear fallback isn't whitelisted for next/image; site uses plain <img> for avatars */}
                <img className="stylist-card__av" src={stylistAvatarSrc(st)} alt="" />
                <span className="stylist-card__head">
                  <b>{st.name}</b>
                  <small>{st.role}</small>
                  <span className={`stylist-card__rating${rated ? '' : ' is-new'}`}>
                    {rated ? (
                      <>
                        <span className="stylist-card__stars">{rating.stars}</span>
                        <span className="stylist-card__reviews">{rating.reviews}</span>
                      </>
                    ) : (
                      'New to Vero'
                    )}
                  </span>
                </span>
              </span>
              {tags.length > 0 && (
                <span className="stylist-card__tags">
                  {tags.map((t) => (
                    <span key={t} className="stylist-card__tag">{t}</span>
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
