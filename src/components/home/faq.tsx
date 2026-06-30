'use client';

import { useState } from 'react';

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="home-faq">
      {items.map((item, i) => {
        const isOpen = openIdx === i;
        return (
          <div className={`home-faq__item${isOpen ? ' is-open' : ''}`} key={item.q}>
            <button
              type="button"
              className="home-faq__q"
              aria-expanded={isOpen}
              onClick={() => setOpenIdx(isOpen ? null : i)}
            >
              <span>{item.q}</span>
              <span className="home-faq__icon" aria-hidden="true">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && <p className="home-faq__a">{item.a}</p>}
          </div>
        );
      })}
    </div>
  );
}
