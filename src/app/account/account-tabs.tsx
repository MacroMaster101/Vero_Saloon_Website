'use client';
import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Icon, type IconName } from '@/components/ui/icon';
import { signOut } from '@/app/admin/actions';
import { ThemeToggle } from '@/components/theme/theme-toggle';

type Tab = 'profile' | 'bookings' | 'settings';
const NAV: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'profile', label: 'Profile', icon: 'user' },
  { id: 'bookings', label: 'Bookings', icon: 'calendar' },
  { id: 'settings', label: 'Settings', icon: 'cog' },
];

export function AccountTabs({
  name, role, initial, memberSince, lastSignIn, avatarUrl, profile, bookings, settings,
}: {
  name: string; role: string; initial: string; memberSince: string; lastSignIn: string; avatarUrl: string | null;
  profile: ReactNode; bookings: ReactNode; settings: ReactNode;
}) {
  const [tab, setTab] = useState<Tab>('profile');
  const view = tab === 'profile' ? profile : tab === 'bookings' ? bookings : settings;

  return (
    <div className="shell">
      <aside className="shell__side">
        <Link href="/" className="side__back"><Icon name="arrowLeft" className="ic" /> Back to home</Link>
        <div className="side__id">
          <span className="avatar">{avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" />
          ) : <b>{initial}</b>}</span>
          <div>
            <div className="side__name">{name}</div>
            <div style={{ marginTop: 4 }}><span className="role-badge">{role}</span></div>
          </div>
        </div>
        <dl className="side__meta">
          <div><dt>Member since</dt><dd>{memberSince}</dd></div>
          <div><dt>Last sign-in</dt><dd>{lastSignIn}</dd></div>
        </dl>
        <nav className="side__nav">
          {NAV.map((n) => (
            <a key={n.id} className={tab === n.id ? 'on' : ''} onClick={() => setTab(n.id)} role="button" tabIndex={0}
               onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setTab(n.id); }}>
              <Icon name={n.icon} className="ic" /> {n.label}
            </a>
          ))}
        </nav>
        <div className="side__foot">
          <form action={signOut}><button className="btn btn--ghost" type="submit"><Icon name="logout" className="ic" /> Sign out</button></form>
          <ThemeToggle />
        </div>
      </aside>
      <main className="shell__main">
        <span className="eyebrow">Your account</span>
        <h1 className="h-section" style={{ fontSize: 30, margin: '10px 0 22px' }}>Hello{name ? <>, <em>{name.split(' ')[0]}</em></> : ''}</h1>
        {view}
      </main>
    </div>
  );
}
