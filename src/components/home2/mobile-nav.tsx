'use client';
import { useEffect, useState } from 'react';
import { BookButton } from '@/components/site/book-button';

// Keep in sync with NAV_LINKS in page.tsx (one entry per on-page section).
const LINKS = [
  { href: '#about', label: 'Story' },
  { href: '#services', label: 'Services' },
  { href: '#how', label: 'How it works' },
  { href: '#looks', label: 'Lookbook' },
  { href: '#team', label: 'Stylists' },
  { href: '#reviews', label: 'Reviews' },
  { href: '#faq', label: 'FAQ' },
  { href: '#visit', label: 'Visit' },
];

export function MobileNav({ showBook }: { showBook: boolean }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="v2-burger"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <span />
      </button>

      <div className={`v2-mobile-nav ${open ? 'is-open' : ''}`}>
        <div className="v2-mobile-backdrop" onClick={() => setOpen(false)} />
        <div className="v2-mobile-panel">
          <button
            type="button"
            className="v2-mobile-close"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
          
          <nav className="v2-mobile-links">
            {LINKS.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="v2-mobile-link"
                style={{ '--link-idx': i } as React.CSSProperties}
              >
                {l.label}
              </a>
            ))}
          </nav>

          {showBook && (
            <div onClick={() => setOpen(false)}>
              <BookButton variant="primary" className="v2-mobile-nav-book">Book a visit</BookButton>
            </div>
          )}

          <div className="v2-mobile-footer">
            <small>Vero Salon Unisex</small>
            <p>10 AM – 12 AM · Open Daily</p>
            <p>Pasyala, Sri Lanka</p>
          </div>
        </div>
      </div>
    </>
  );
}

