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
      <p className="step__hint">Choose a stylist, or let us match you with whoever&apos;s free.</p>
      <div className="choices choices--2" id="barberList">
        <button
          type="button"
          className={`choice${noPref ? ' sel' : ''}`}
          onClick={() => onSelect(null)}
          aria-pressed={noPref}
        >
          <span className="choice__ic">✦</span>
          <span className="choice__txt">
            <b>No preference</b>
            <small>Next available stylist</small>
          </span>
        </button>
        {stylists.map((st) => {
          const sel = touched && selectedId === st.id;
          const rating = ratingLabel(st.rating, st.rating_count);
          const tags = (st.tags ?? []).slice(0, 2);
          return (
            <button
              type="button"
              key={st.id}
              className={`choice${sel ? ' sel' : ''}`}
              onClick={() => onSelect(st.id)}
              aria-pressed={sel}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- remote DiceBear fallback isn't whitelisted for next/image; site uses plain <img> for avatars */}
              <img className="choice__av" src={stylistAvatarSrc(st)} alt="" />
              <span className="choice__txt">
                <b>{st.name}</b>
                <small>{st.role}</small>
                <span className="choice__rating">
                  <span className="choice__stars">{rating.stars}</span>
                  {rating.reviews && <span className="choice__reviews">{rating.reviews}</span>}
                </span>
                {tags.length > 0 && (
                  <span className="choice__tags">
                    {tags.map((t) => (
                      <span key={t} className="choice__tag">{t}</span>
                    ))}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
