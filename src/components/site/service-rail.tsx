'use client';
import type { Service } from '@/lib/supabase/types';

export function ServiceRail({ services }: { services: Service[] }) {
  const items = services.slice(0, 8);
  if (items.length === 0) return null;
  return (
    <div className="srail-wrap">
      <div className="srail-head">
        <h2 className="srail-title">Featured services</h2>
        <a href="#services" className="srail-all">See all &rsaquo;</a>
      </div>
      <div className="srail" role="list">
        {items.map((s) => (
          <a key={s.id} className="srail__card" href="#book" role="listitem">
            <span className="srail__name">{s.name}</span>
            <span className="srail__price">Rs {s.price_lkr.toLocaleString()}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
