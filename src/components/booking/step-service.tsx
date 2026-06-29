'use client';
import type { Service } from '@/lib/supabase/types';
import { money } from '@/lib/format';
import { servicePhoto } from '@/lib/service-photo';

export function StepService({
  services,
  selectedId,
  onSelect,
}: {
  services: Service[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="step active" data-step="0">
      <h3 className="step__title">What are you booking?</h3>
      <p className="step__hint">Pick one — you can add notes for your stylist at the end.</p>
      <div className="choices" id="serviceList">
        {services.map((s) => (
          <button
            type="button"
            key={s.id}
            className={`choice${selectedId === s.id ? ' sel' : ''}`}
            onClick={() => onSelect(s.id)}
            aria-pressed={selectedId === s.id}
          >
            {(() => {
              const photo = servicePhoto(s);
              return (
                // eslint-disable-next-line @next/next/no-img-element -- local default + remote admin uploads; site uses plain <img>
                <img
                  className="choice__photo"
                  src={photo.type === 'img' ? photo.src : ''}
                  alt=""
                  onError={(e) => {
                    // graceful fallback: swap a broken photo for the neutral default tile
                    const el = e.currentTarget;
                    if (!el.dataset.fallback) { el.dataset.fallback = '1'; el.src = '/images/services/hair.png'; }
                  }}
                />
              );
            })()}
            <span className="choice__txt">
              <b>{s.name}</b>
              <small>
                {s.description} · {s.duration_min} min
              </small>
            </span>
            <span className="choice__price">{money(s.price_lkr)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
