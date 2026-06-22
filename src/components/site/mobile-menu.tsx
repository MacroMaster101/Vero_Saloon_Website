'use client';

import { useState } from 'react';
import type { Profile } from '@/lib/supabase/auth';
import { signOut } from '@/app/admin/actions';

const LINKS: { href: string; label: string }[] = [
  { href: '#services', label: 'Services' },
  { href: '#destinations', label: 'Our Work' },
  { href: '#how', label: 'Your Visit' },
  { href: '#team', label: 'Stylists' },
  { href: '#visit', label: 'Find Us' },
  { href: '#book', label: 'Book now' },
];

export function MobileMenu({ profile }: { profile: Profile | null }) {
  const [open, setOpen] = useState(false);
  const dash = profile ? (profile.role === 'admin' ? '/admin' : profile.role === 'staff' ? '/admin/schedule' : '/account') : null;
  const label = profile ? (profile.role === 'user' ? 'Account' : profile.role === 'staff' ? 'My schedule' : 'Admin') : null;

  return (
    <>
      <button
        className="nav__burger"
        id="burger"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
      >
        <span></span><span></span><span></span>
      </button>

      <div className={`mobile-menu${open ? ' open' : ''}`} id="mobileMenu">
        <div className="mobile-menu__top">
          <div className="brand">
            <span className="brand__mark" style={{ color: 'var(--accent)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" width="30" height="30" aria-hidden="true"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>
            </span>
            <span className="brand__name">VERO<span aria-hidden="true" style={{ color: 'var(--accent)' }}>✦</span><small>SALON · UNISEX</small></span>
          </div>
          <button className="mobile-menu__close" id="menuClose" aria-label="Close" onClick={() => setOpen(false)}>×</button>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column' }}>
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} data-close onClick={() => setOpen(false)}>{l.label}</a>
          ))}
          <div style={{ height: '1px', background: 'rgba(247,241,228,.12)', margin: '20px 0 10px' }} />
          {profile ? (
            <>
              <a href={dash ?? undefined} data-close onClick={() => setOpen(false)} style={{ color: 'var(--accent)' }}>{label}</a>
              <form action={signOut} style={{ marginTop: '16px' }}>
                <button className="btn btn--ghost" style={{ width: '100%', borderColor: 'rgba(247,241,228,.24)', color: 'var(--bg)' }} type="submit">Sign out</button>
              </form>
            </>
          ) : (
            <a href="/login" data-close onClick={() => setOpen(false)} style={{ color: 'var(--accent)' }}>Sign in</a>
          )}
        </nav>
      </div>
    </>
  );
}
