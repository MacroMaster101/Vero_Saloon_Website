'use client';
import { useEffect, useRef, useState } from 'react';
import type { Stylist } from '@/lib/supabase/types';
import { StylistModal } from './stylist-modal';
import { getFallbackImage } from './img-slot';

export function StylistCarousel({ stylists }: { stylists: Stylist[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<Stylist | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.querySelectorAll<HTMLElement>('.scar__card'));
    if (cards.length === 0) return;

    // Mark the card whose centre is nearest the track's centre. Runs on mount
    // (so a card is highlighted before any scroll) and on every scroll frame.
    let ticking = false;
    const mark = () => {
      const mid = track.scrollLeft + track.clientWidth / 2;
      let bestIdx = 0;
      let bestDist = Infinity;
      cards.forEach((c, i) => {
        const cardMid = c.offsetLeft + c.offsetWidth / 2;
        const dist = Math.abs(cardMid - mid);
        if (dist < bestDist) { bestDist = dist; bestIdx = i; }
      });
      cards.forEach((c, i) => c.classList.toggle('is-center', i === bestIdx));
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { mark(); ticking = false; });
    };

    mark();
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => track.removeEventListener('scroll', onScroll);
  }, [stylists.length]);

  if (stylists.length === 0) return null;

  return (
    <div className="scar-wrap">
      <h2 className="scar-title">Meet our stylists</h2>
      <div className="scar" ref={trackRef}>
        {stylists.map((s) => {
          const img = getFallbackImage(s.avatar_url, s.name) ?? '';
          const tags = s.tags ?? [];
          return (
            <button key={s.id} type="button" className="scar__card" onClick={() => setOpen(s)}>
              {img
                ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="scar__img" src={img} alt={s.name} />
                  )
                : <span className="scar__img scar__img--empty" aria-hidden="true" />}
              <span className="scar__scrim" aria-hidden="true" />
              <span className="scar__rating">{s.rating != null && s.rating_count ? `★ ${Number(s.rating).toFixed(1)}` : 'New'}</span>
              <span className="scar__meta">
                <span className="scar__name">{s.name}</span>
                {s.role && <span className="scar__role">{s.role}</span>}
                {tags.length > 0 && (
                  <span className="scar__tags">
                    {tags.slice(0, 2).map((t) => <span key={t} className="scar__tag">{t}</span>)}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
      <StylistModal stylist={open} onClose={() => setOpen(null)} bookHref="#book" />
    </div>
  );
}
