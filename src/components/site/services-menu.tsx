'use client';
import { useState } from 'react';
import { money } from '@/lib/format';
import type { Service } from '@/lib/supabase/types';

function PriceRow({ s }: { s: Service }) {
  return (
    <div className="price-row">
      <span className="name">{s.name}</span>
      <span className="price">{money(s.price_lkr)}</span>
      <span className="desc">{s.description}</span>
      <span className="dur">{s.duration_min} min</span>
    </div>
  );
}

export function ServicesMenu({
  hair, beauty, featured,
}: { hair: Service[]; beauty: Service[]; featured: Service | null }) {
  const [tab, setTab] = useState<'hair' | 'beauty'>('hair');
  const list = tab === 'hair' ? hair : beauty;

  return (
    <div className="svc reveal">
      <div className="svc__switch" role="tablist" aria-label="Service categories">
        <button type="button" role="tab" aria-selected={tab === 'hair'}
          className={`svc__tab${tab === 'hair' ? ' is-on' : ''}`} onClick={() => setTab('hair')}>
          Hair <span className="svc__count">{hair.length}</span>
        </button>
        <button type="button" role="tab" aria-selected={tab === 'beauty'}
          className={`svc__tab${tab === 'beauty' ? ' is-on' : ''}`} onClick={() => setTab('beauty')}>
          Beauty &amp; bridal <span className="svc__count">{beauty.length}</span>
        </button>
      </div>

      <div className="svc__grid">
        <div className="svc__list">
          {list.map((s) => <PriceRow key={s.id} s={s} />)}
        </div>

        {featured && (
          <aside className="svc__feature">
            <span className="svc__feature-tag">Featured</span>
            <h3 className="svc__feature-name">{featured.name}</h3>
            <p className="svc__feature-desc">{featured.description}</p>
            <div className="svc__feature-meta">
              <span className="svc__feature-price">{money(featured.price_lkr)}</span>
              <span className="svc__feature-dur">{featured.duration_min} min</span>
            </div>
            <a href="#book" className="btn btn--primary svc__feature-cta">Book this</a>
          </aside>
        )}
      </div>
    </div>
  );
}
