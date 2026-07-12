'use client';
import type { ReactNode } from 'react';

/** Image with the home page's one-shot onError fallback swap (services-tabs). */
export function CardImg({ src, fallbackSrc, className, alt = '' }: {
  src: string;
  fallbackSrc?: string;
  className?: string;
  alt?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- local defaults + remote admin uploads / avatars; site uses plain <img> here
    <img
      className={className}
      src={src}
      data-fb={fallbackSrc ?? ''}
      alt={alt}
      loading="lazy"
      onError={(e) => {
        // graceful fallback: a broken photo degrades to the provided fallback,
        // then stops retrying (same pattern as the home service cards).
        const el = e.currentTarget;
        const fb = el.dataset.fb || '/images/services/hair.png';
        if (!el.dataset.fallback && el.src !== fb) { el.dataset.fallback = '1'; el.src = fb; }
      }}
    />
  );
}

export type MediaCardBadge = { label: string; tone?: 'hidden' | 'featured' };

/**
 * Admin media card — the dashboards' twin of the home page's `.home-scard`:
 * photo (or avatar stage) on top, name + price/meta below, actions in the
 * footer. `children` is the actions row (edit <details> + delete form).
 */
export function MediaCard({ media, title, price, meta, dur, badges = [], children }: {
  media: { src: string; fallbackSrc?: string; shape?: 'photo' | 'avatar' };
  title: string;
  price?: string;
  meta?: ReactNode;
  dur?: string;
  badges?: MediaCardBadge[];
  children: ReactNode;
}) {
  const avatar = media.shape === 'avatar';
  return (
    <li className="mcard">
      <div className={`mcard__media${avatar ? ' mcard__media--avatar' : ''}`}>
        <CardImg
          src={media.src}
          fallbackSrc={media.fallbackSrc}
          className={avatar ? 'mcard__avatar' : 'mcard__photo'}
        />
        {badges.length > 0 && (
          <span className="mcard__badges">
            {badges.map((b) => (
              <span key={b.label} className={`mcard__badge${b.tone ? ` mcard__badge--${b.tone}` : ''}`}>
                {b.label}
              </span>
            ))}
          </span>
        )}
      </div>
      <div className="mcard__body">
        <div className="mcard__top">
          <b className="mcard__name">{title}</b>
          {price && <span className="mcard__price">{price}</span>}
        </div>
        {meta && <span className="mcard__meta">{meta}</span>}
        {dur && <span className="mcard__dur">{dur}</span>}
      </div>
      <div className="mcard__actions">{children}</div>
    </li>
  );
}
