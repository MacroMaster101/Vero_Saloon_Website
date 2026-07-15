'use client';
import { useEffect, useRef, useState } from 'react';
import { signOut } from '@/app/admin/actions';
import type { Profile } from '@/lib/supabase/auth';
import { avatarSrc, type UserMetadata } from '@/lib/avatar';
import { useAccountModals } from '@/components/account/account-modals';
import { t } from '@/lib/i18n/translations';

export function NavAuth({ profile, userMetadata, locale = 'en' }: { profile: Profile | null; userMetadata?: UserMetadata | null; locale?: string }) {
  const [open, setOpen] = useState(false);
  const { openModal } = useAccountModals();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!profile) return <a href="/login" className="nav__cta">{t('Sign in', locale)}</a>;

  const isUser = profile.role === 'user';
  // Each elevated role has its own surface: admin console, owner dashboard,
  // staff schedule. (/admin/schedule is admin-only — staff must go to /staff.)
  const dash = profile.role === 'admin' ? '/admin' : profile.role === 'owner' ? '/owner' : '/staff';
  const dashLabel = profile.role === 'admin' ? t('Admin', locale) : profile.role === 'owner' ? t('My shop', locale) : t('My schedule', locale);
  const seed = profile.email ?? profile.fullName ?? 'guest';
  const src = avatarSrc(userMetadata, seed);

  function pick(modal: 'profile' | 'bookings' | 'settings') {
    setOpen(false);
    openModal(modal);
  }

  return (
    <div className={`nav-profile${open ? ' open' : ''}`} ref={ref}>
      <button
        type="button"
        className="nav-profile__btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen((v) => !v)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="nav-profile__avatar" />
      </button>

      <div className="nav-profile__menu" role="menu" hidden={!open}>
        <div className="nav-profile__head">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="nav-profile__avatar" />
          <div className="nav-profile__id">
            <b>{profile.fullName ?? t('Account', locale)}</b>
            {profile.email && <span>{profile.email}</span>}
          </div>
        </div>
        <button type="button" role="menuitem" className="nav-profile__item" onClick={() => pick('profile')}>
          {t('Edit profile', locale)}
        </button>
        {isUser ? (
          <button type="button" role="menuitem" className="nav-profile__item" onClick={() => pick('bookings')}>
            {t('My bookings', locale)}
          </button>
        ) : (
          <a href={dash} role="menuitem" className="nav-profile__item" onClick={() => setOpen(false)}>
            {dashLabel}
          </a>
        )}
        <button type="button" role="menuitem" className="nav-profile__item" onClick={() => pick('settings')}>
          {t('Settings', locale)}
        </button>
        <form action={signOut}>
          <button type="submit" role="menuitem" className="nav-profile__item nav-profile__item--danger">
            {t('Sign out', locale)}
          </button>
        </form>
      </div>
    </div>
  );
}
