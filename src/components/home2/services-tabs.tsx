'use client';

import { useState } from 'react';
import { money } from '@/lib/format';
import { BookButton } from '@/components/site/book-button';
import type { Service } from '@/lib/supabase/types';

function PriceRow({ s }: { s: Service }) {
  return (
    <div className="v2-price">
      <span className="v2-price__name">{s.name}</span>
      <span className="v2-price__price">{money(s.price_lkr)}</span>
      {s.description && <span className="v2-price__desc">{s.description}</span>}
      <span className="v2-price__dur">{s.duration_min} min</span>
    </div>
  );
}

export function ServicesTabs({
  hair,
  beauty,
  featured,
}: {
  hair: Service[];
  beauty: Service[];
  featured: Service | null;
}) {
  const [tab, setTab] = useState<'hair' | 'beauty'>('hair');
  const list = tab === 'hair' ? hair : beauty;

  return (
    <>
      <div className="v2-svc__head">
        <div className="v2-svc__tabs" role="tablist" aria-label="Service categories">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'hair'}
            className={`v2-svc__tab${tab === 'hair' ? ' is-on' : ''}`}
            onClick={() => setTab('hair')}
          >
            Hair menu
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'beauty'}
            className={`v2-svc__tab${tab === 'beauty' ? ' is-on' : ''}`}
            onClick={() => setTab('beauty')}
          >
            Beauty &amp; bridal
          </button>
        </div>
      </div>

      <div className="v2-svc__grid">
        <div className="v2-card v2-svc__list">
          {list.map((s) => (
            <PriceRow key={s.id} s={s} />
          ))}
        </div>

        {featured && (
          <aside className="v2-card v2-feature">
            <span className="v2-feature__tag">✦ Signature spotlight</span>
            <h3>{featured.name}</h3>
            <p>{featured.description}</p>
            <div className="v2-feature__price">
              <b>{money(featured.price_lkr)}</b>
              <span>{featured.duration_min} minutes</span>
            </div>
            <div style={{ width: '100%' }}>
              <BookButton variant="primary" className="v2-feature__book">Book this service</BookButton>
            </div>
          </aside>
        )}
      </div>
    </>
  );
}
