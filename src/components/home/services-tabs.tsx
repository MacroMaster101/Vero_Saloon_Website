'use client';

import { useState } from 'react';
import { money } from '@/lib/format';
import { BookButton } from '@/components/site/book-button';
import type { Service } from '@/lib/supabase/types';

function PriceRow({ s }: { s: Service }) {
  return (
    <div className="home-price">
      <span className="home-price__name">{s.name}</span>
      <span className="home-price__price">{money(s.price_lkr)}</span>
      {s.description && <span className="home-price__desc">{s.description}</span>}
      <span className="home-price__dur">{s.duration_min} min</span>
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
      <div className="home-svc__head">
        <div className="home-svc__tabs" role="tablist" aria-label="Service categories">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'hair'}
            className={`home-svc__tab${tab === 'hair' ? ' is-on' : ''}`}
            onClick={() => setTab('hair')}
          >
            Hair menu
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'beauty'}
            className={`home-svc__tab${tab === 'beauty' ? ' is-on' : ''}`}
            onClick={() => setTab('beauty')}
          >
            Beauty &amp; bridal
          </button>
        </div>
      </div>

      <div className="home-svc__grid">
        <div className="home-card home-svc__list">
          {list.map((s) => (
            <PriceRow key={s.id} s={s} />
          ))}
        </div>

        {featured && (
          <aside className="home-card home-feature">
            <span className="home-feature__tag">✦ Signature spotlight</span>
            <h3>{featured.name}</h3>
            <p>{featured.description}</p>
            <div className="home-feature__price">
              <b>{money(featured.price_lkr)}</b>
              <span>{featured.duration_min} minutes</span>
            </div>
            <div style={{ width: '100%' }}>
              <BookButton variant="primary" className="home-feature__book">Book this service</BookButton>
            </div>
          </aside>
        )}
      </div>
    </>
  );
}
