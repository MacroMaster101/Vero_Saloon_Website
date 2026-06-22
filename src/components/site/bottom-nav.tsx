'use client';

import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/theme/theme-toggle';

type Tab = { id: string; href: string; label: string; icon: React.ReactNode };

const HomeIcon = (
  <svg className="ic-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 10.5 12 4l9 6.5" /><path d="M5 9.5V20h14V9.5" /></svg>
);
const ScissorsIcon = (
  <svg className="ic-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" /><line x1="8.12" y1="8.12" x2="12" y2="12" /></svg>
);
const TeamIcon = (
  <svg className="ic-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" /><path d="M16 6.5a3 3 0 0 1 0 6" /><path d="M17.5 19a5 5 0 0 0-3-4.6" /></svg>
);
const MoreIcon = (
  <svg className="ic-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></svg>
);
const BookIcon = (
  <svg className="ic-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="5" width="16" height="16" rx="2" /><line x1="4" y1="9" x2="20" y2="9" /><line x1="9" y1="3" x2="9" y2="6" /><line x1="15" y1="3" x2="15" y2="6" /></svg>
);

const TABS: Tab[] = [
  { id: 'top', href: '#top', label: 'Home', icon: HomeIcon },
  { id: 'services', href: '#services', label: 'Services', icon: ScissorsIcon },
  { id: 'team', href: '#team', label: 'Stylists', icon: TeamIcon },
];

// Secondary links shown in the "More" sheet.
const MORE_LINKS: { href: string; label: string }[] = [
  { href: '#destinations', label: 'Our Work' },
  { href: '#how', label: 'Your Visit' },
  { href: '#visit', label: 'Find Us' },
];

// Section ids the scroll-spy watches (tabs + book).
const SPY_IDS = ['top', 'services', 'team', 'book', 'destinations', 'how', 'visit'];

export function BottomNav() {
  const [active, setActive] = useState('top');
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const els = SPY_IDS
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const closeMore = () => setMoreOpen(false);

  return (
    <>
      <div
        className={`more-sheet${moreOpen ? ' open' : ''}`}
        onClick={closeMore}
        aria-hidden={!moreOpen}
      >
        <div className="more-sheet__panel" onClick={(e) => e.stopPropagation()}>
          <div className="more-sheet__grip" />
          <nav className="more-sheet__links">
            {MORE_LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={closeMore}>{l.label}</a>
            ))}
          </nav>
          <div className="more-sheet__row">
            <span>Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <nav className="bottom-nav" aria-label="Primary">
        {TABS.map((t) => (
          <a
            key={t.id}
            href={t.href}
            className={`bottom-nav__tab${active === t.id ? ' is-active' : ''}`}
            onClick={closeMore}
          >
            <span className="bottom-nav__icon">{t.icon}</span>
            <span className="bottom-nav__label">{t.label}</span>
          </a>
        ))}
        <a
          href="#book"
          className={`bottom-nav__fab${active === 'book' ? ' is-active' : ''}`}
          onClick={closeMore}
          aria-label="Book now"
        >
          <span className="bottom-nav__icon">{BookIcon}</span>
          <span className="bottom-nav__fab-label">Book</span>
        </a>
        <button
          type="button"
          className={`bottom-nav__tab${moreOpen ? ' is-active' : ''}`}
          onClick={() => setMoreOpen((v) => !v)}
          aria-expanded={moreOpen}
        >
          <span className="bottom-nav__icon">{MoreIcon}</span>
          <span className="bottom-nav__label">More</span>
        </button>
      </nav>
    </>
  );
}
