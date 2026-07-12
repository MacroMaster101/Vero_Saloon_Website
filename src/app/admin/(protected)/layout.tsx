import Link from 'next/link';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { requireRole } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { getAvatarInfo } from '@/lib/avatar';
import { signOut } from '../actions';
import { Icon, type IconName } from '@/components/ui/icon';
import { NavLinks } from './nav-links';
import { AdminBottomNav, type AdminNavItem } from './admin-bottom-nav';

const ADMIN_NAV: { href: string; label: string; icon: IconName }[] = [
  { href: '/admin', label: 'Dashboard', icon: 'grid' },
  { href: '/admin/account', label: 'Account', icon: 'user' },
  { href: '/admin/people', label: 'People', icon: 'people' },
  { href: '/admin/services', label: 'Services', icon: 'scissors' },
  { href: '/admin/stylists', label: 'Stylists', icon: 'user' },
  { href: '/admin/gallery', label: 'Gallery', icon: 'grid' },
  { href: '/admin/reviews', label: 'Reviews', icon: 'user' },
  { href: '/admin/content', label: 'Content', icon: 'cog' },
  { href: '/admin/schedule', label: 'Schedule', icon: 'calendar' },
  { href: '/admin/holidays', label: 'Holidays', icon: 'calendar' },
];
// Mobile bottom-nav split: up to 5 primary tabs in the bar, the rest go to "More".
const ADMIN_PRIMARY: AdminNavItem[] = [
  { href: '/admin', label: 'Dashboard', short: 'Home', icon: 'grid' },
  { href: '/admin/people', label: 'People', icon: 'people' },
  { href: '/admin/services', label: 'Services', short: 'Serv', icon: 'scissors' },
  { href: '/admin/schedule', label: 'Schedule', short: 'Sched', icon: 'calendar' },
];
const ADMIN_OVERFLOW: AdminNavItem[] = [
  { href: '/admin/account', label: 'Account', icon: 'user' },
  { href: '/admin/stylists', label: 'Stylists', icon: 'user' },
  { href: '/admin/gallery', label: 'Gallery', icon: 'grid' },
  { href: '/admin/reviews', label: 'Reviews', icon: 'user' },
  { href: '/admin/content', label: 'Content', icon: 'cog' },
  { href: '/admin/holidays', label: 'Holidays', icon: 'calendar' },
];

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole(['admin'], '/admin');
  const nav = ADMIN_NAV;
  const btmPrimary = ADMIN_PRIMARY;
  const btmOverflow = ADMIN_OVERFLOW;
  // Same avatar resolution as the site header and staff desk: uploaded photo →
  // Google/email photo → DiceBear fallback (never just an initial).
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  const seed = profile.email ?? profile.fullName ?? 'admin';
  const avatar = getAvatarInfo(user?.user_metadata ?? null, seed).src;

  return (
    <div className="shell shell--admin">
      <aside className="shell__side">
        <Link href="/" className="side__back"><Icon name="arrowLeft" className="ic" /> <span className="side__back-txt">Back to site</span></Link>
        <div className="side__brand"><span className="pole" style={{ height: 26 }} /> Vero Salon
          <span className="role-badge" style={{ marginLeft: 'auto' }}>Admin</span>
        </div>
        {/* Mobile-only: the sidebar footer (with the desktop toggle) is hidden
            on phones, so the app bar carries its own theme switch. */}
        <span className="side__theme"><ThemeToggle /></span>
        {/* The profile card doubles as the shortcut to the Account page —
            on mobile the avatar in the app bar is that same tap target. */}
        <Link href="/admin/account" className="side__id" aria-label="Your account">
          <span className="avatar">
            {/* eslint-disable-next-line @next/next/no-img-element -- remote DiceBear/Google avatars aren't whitelisted for next/image */}
            <img src={avatar} alt="" />
          </span>
          <div className="side__name">{profile.fullName ?? profile.email}</div>
        </Link>
        <NavLinks items={nav} />
        <div className="side__foot">
          <form action={signOut}><button className="btn btn--ghost" type="submit"><Icon name="logout" className="ic" /> Sign out</button></form>
          <ThemeToggle />
        </div>
      </aside>
      <main className="shell__main">{children}</main>
      <AdminBottomNav primary={btmPrimary} overflow={btmOverflow} />
    </div>
  );
}
