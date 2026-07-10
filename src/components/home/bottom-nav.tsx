'use client';

import { useEffect, useRef, useState } from 'react';
import { useBooking } from '@/components/booking/booking-provider';
import { useAccountModals, type AccountModal } from '@/components/account/account-modals';
import { signOut } from '@/app/admin/actions';

/* Floating mobile/tablet bottom dock — the single nav surface on small screens
   (the top bar carries the brand only there). Five slots with the Book action
   raised in the centre:  Home · Services · [Book] · More · Sign in.
   "More" opens a sheet with the remaining on-page sections. Section ids mirror
   SECTIONS in home-effects.tsx; we run a lightweight scroll-spy to light tabs. */

// Primary tabs flanking the centre action (left pair + right slot).
const LEFT = [
  { id: 'top', label: 'Home', icon: 'home' },
  { id: 'services', label: 'Services', icon: 'scissors' },
] as const;

// Everything reachable from the "More" sheet.
const MORE_LINKS = [
  { id: 'about', label: 'Story' },
  { id: 'how', label: 'How it works' },
  { id: 'looks', label: 'Lookbook' },
  { id: 'team', label: 'Stylists' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'faq', label: 'FAQ' },
  { id: 'visit', label: 'Visit' },
];

// Ids the scroll-spy watches to decide which dock item is active. MUST be in
// true DOM (top-to-bottom) order — the loop takes the last section whose top
// has crossed the line, so a mis-ordered list highlights the wrong tab.
const SPY_IDS = ['top', 'about', 'services', 'how', 'looks', 'team', 'reviews', 'faq', 'visit'];

function Icon({ name }: { name: string }) {
  const common = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'home':
      return <svg {...common}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>;
    case 'scissors':
      return <svg {...common}><circle cx="6" cy="6" r="2.5" /><circle cx="6" cy="18" r="2.5" /><path d="M8 7.5 20 18M8 16.5 20 6" /></svg>;
    case 'pin':
      return <svg {...common}><path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>;
    case 'book':
      return <svg {...common}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 7h8M8 11h8M8 15h5" /></svg>;
    case 'user':
      return <svg {...common}><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>;
    case 'more':
      return <svg {...common}><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></svg>;
    default:
      return null;
  }
}

export function BottomNav({ signedIn, accountHref, accountLabel, avatarSrc }: {
  signedIn: boolean;
  accountHref: string | null;   // null → account tab opens the popup menu instead of navigating
  accountLabel: string;
  avatarSrc?: string | null;
}) {
  const { openBooking, enabled } = useBooking();
  const { openModal } = useAccountModals();
  const [active, setActive] = useState<string>('top');
  const [moreOpen, setMoreOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      let current = 'top';
      const line = window.innerHeight * 0.4;
      for (const id of SPY_IDS) {
        const el = id === 'top' ? null : document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = SPY_IDS[SPY_IDS.length - 1] ?? current;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the More/Account sheets on outside-click / Escape.
  useEffect(() => {
    if (!moreOpen && !acctOpen) return;
    const closeAll = () => { setMoreOpen(false); setAcctOpen(false); };
    const onDown = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) closeAll();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeAll(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [moreOpen, acctOpen]);

  function pickAccount(modal: AccountModal) {
    setAcctOpen(false);
    openModal(modal);
  }

  const moreActive = MORE_LINKS.some((l) => l.id === active);

  return (
    <div className="home-dock" ref={moreRef}>
      {/* ── "More" sheet ── */}
      <div className={`home-dock__sheet${moreOpen ? ' is-open' : ''}`} role="menu">
        {MORE_LINKS.map((l) => (
          <a
            key={l.id}
            href={`#${l.id}`}
            role="menuitem"
            className={`home-dock__sheet-item${active === l.id ? ' is-active' : ''}`}
            onClick={() => { setMoreOpen(false); setAcctOpen(false); }}
          >
            {l.label}
          </a>
        ))}
      </div>

      {/* ── "Account" sheet (signed-in customers) ── */}
      <div className={`home-dock__sheet${acctOpen ? ' is-open' : ''}`} role="menu">
        <button type="button" role="menuitem" className="home-dock__sheet-item" onClick={() => pickAccount('profile')}>
          Edit profile
        </button>
        <button type="button" role="menuitem" className="home-dock__sheet-item" onClick={() => pickAccount('bookings')}>
          My bookings
        </button>
        <button type="button" role="menuitem" className="home-dock__sheet-item" onClick={() => pickAccount('settings')}>
          Settings
        </button>
        <form action={signOut}>
          <button type="submit" role="menuitem" className="home-dock__sheet-item home-dock__sheet-item--danger">
            Sign out
          </button>
        </form>
      </div>

      <nav className="home-bottomnav" aria-label="Quick navigation">
        {LEFT.map((t) => (
          <a
            key={t.id}
            href={`#${t.id}`}
            className={`home-bottomnav__tab${active === t.id ? ' is-active' : ''}`}
            aria-current={active === t.id ? 'page' : undefined}
            onClick={() => { setMoreOpen(false); setAcctOpen(false); }}
          >
            <Icon name={t.icon} />
            <span>{t.label}</span>
          </a>
        ))}

        {/* ── raised centre action ── */}
        {enabled ? (
          <button type="button" className="home-bottomnav__center" onClick={() => { setMoreOpen(false); setAcctOpen(false); openBooking(); }} aria-label="Book a visit">
            <Icon name="book" />
            <span>Book</span>
          </button>
        ) : (
          <a href="#top" className="home-bottomnav__center" onClick={() => { setMoreOpen(false); setAcctOpen(false); }} aria-label="Back to top">
            <Icon name="home" />
            <span>Top</span>
          </a>
        )}

        <button
          type="button"
          className={`home-bottomnav__tab${moreActive || moreOpen ? ' is-active' : ''}`}
          aria-haspopup="menu"
          aria-expanded={moreOpen}
          onClick={() => { setAcctOpen(false); setMoreOpen((v) => !v); }}
        >
          <Icon name="more" />
          <span>More</span>
        </button>

        {accountHref ? (
          <a href={accountHref} className="home-bottomnav__tab" onClick={() => { setMoreOpen(false); setAcctOpen(false); }}>
            {signedIn && avatarSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarSrc} alt="" className="home-bottomnav__avatar" />
            ) : (
              <Icon name="user" />
            )}
            <span>{signedIn ? accountLabel : 'Sign in'}</span>
          </a>
        ) : (
          <button
            type="button"
            className={`home-bottomnav__tab${acctOpen ? ' is-active' : ''}`}
            aria-haspopup="menu"
            aria-expanded={acctOpen}
            onClick={() => { setMoreOpen(false); setAcctOpen((v) => !v); }}
          >
            {avatarSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarSrc} alt="" className="home-bottomnav__avatar" />
            ) : (
              <Icon name="user" />
            )}
            <span>{accountLabel}</span>
          </button>
        )}
      </nav>
    </div>
  );
}
