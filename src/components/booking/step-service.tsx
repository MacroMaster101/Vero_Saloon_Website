'use client';
import type { Service } from '@/lib/supabase/types';
import { money } from '@/lib/format';
import { servicePhoto } from '@/lib/service-photo';

export function StepService({
  services,
  selectedIds,
  onSelect,
}: {
  services: Service[];
  selectedIds: string[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="step active" data-step="0">
      <h3 className="step__title">What are you booking?</h3>
      <p className="step__hint">
        Pick one or more — we&apos;ll bundle them into a single visit. Add notes for your stylist at the end.
      </p>
      <div className="choices choices--grid" id="serviceList">
        {services.map((s) => {
          const selected = selectedIds.includes(s.id);
          const photo = servicePhoto(s);
          return (
            <button
              type="button"
              key={s.id}
              className={`choice choice--card${selected ? ' sel' : ''}`}
              onClick={() => onSelect(s.id)}
              aria-pressed={selected}
            >
              <span className="choice__check" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element -- local default + remote admin uploads; site uses plain <img> */}
              <img
                className="choice__photo"
                src={photo.type === 'img' ? photo.src : ''}
                data-fb={photo.type === 'img' ? (photo.fallbackSrc ?? '') : ''}
                alt=""
                onError={(e) => {
                  // graceful fallback: a broken photo degrades to the service's
                  // category default (not a generic one), then stops retrying.
                  const el = e.currentTarget;
                  const fb = el.dataset.fb || '/images/services/hair.png';
                  if (!el.dataset.fallback && el.src !== fb) { el.dataset.fallback = '1'; el.src = fb; }
                }}
              />
              <span className="choice__txt">
                <b>{s.name}</b>
                <small>
                  {s.description} · {s.duration_min} min
                </small>
              </span>
              <span className="choice__price">{money(s.price_lkr)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
