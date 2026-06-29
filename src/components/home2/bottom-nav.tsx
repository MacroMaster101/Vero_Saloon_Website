'use client';

import { useEffect, useState } from 'react';
import { useBooking } from '@/components/booking/booking-provider';

/* Mobile-only bottom tab bar — the single nav surface on phones (the top bar
   carries the brand only there). Section ids mirror SECTIONS in
   home-effects.tsx; we run our own lightweight scroll-spy to light the tabs. */
const TABS = [
  { id: 'top', label: 'Home', icon: 'home' },
  { id: 'services', label: 'Services', icon: 'scissors' },
  { id: 'team', label: 'Stylists', icon: 'people' },
  { id: 'visit', label: 'Visit', icon: 'pin' },
] as const;

function Icon({ name }: { name: string }) {
  const common = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'home':
      return <svg {...common}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>;
    case 'scissors':
      return <svg {...common}><circle cx="6" cy="6" r="2.5" /><circle cx="6" cy="18" r="2.5" /><path d="M8 7.5 20 18M8 16.5 20 6" /></svg>;
    case 'people':
      return <svg {...common}><circle cx="9" cy="8" r="3" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0" /><path d="M16 5.5a3 3 0 0 1 0 5.8M17 20a5.5 5.5 0 0 0-2.5-4.6" /></svg>;
    case 'pin':
      return <svg {...common}><path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>;
    case 'book':
      return <svg {...common}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 7h8M8 11h8M8 15h5" /></svg>;
    case 'user':
      return <svg {...common}><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>;
    default:
      return null;
  }
}

export function BottomNav({ signedIn, accountHref, accountLabel, avatarSrc }: {
  signedIn: boolean;
  accountHref: string;
  accountLabel: string;
  avatarSrc?: string | null;
}) {
  const { openBooking, enabled } = useBooking();
  const [active, setActive] = useState<string>('top');

  useEffect(() => {
    const ids = TABS.map((t) => t.id);
    const onScroll = () => {
      let current = 'top';
      const line = window.innerHeight * 0.4;
      for (const id of ids) {
        const el = id === 'top' ? null : document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = ids[ids.length - 1] ?? current;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className="v2-bottomnav" aria-label="Quick navigation">
      {TABS.map((t) => (
        <a
          key={t.id}
          href={`#${t.id}`}
          className={`v2-bottomnav__tab${active === t.id ? ' is-active' : ''}`}
          aria-current={active === t.id ? 'page' : undefined}
        >
          <Icon name={t.icon} />
          <span>{t.label}</span>
        </a>
      ))}

      {enabled && (
        <button type="button" className="v2-bottomnav__tab v2-bottomnav__book" onClick={openBooking}>
          <Icon name="book" />
          <span>Book</span>
        </button>
      )}

      <a href={accountHref} className="v2-bottomnav__tab">
        {signedIn && avatarSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarSrc} alt="" className="v2-bottomnav__avatar" />
        ) : (
          <Icon name="user" />
        )}
        <span>{signedIn ? accountLabel : 'Sign in'}</span>
      </a>
    </nav>
  );
}
