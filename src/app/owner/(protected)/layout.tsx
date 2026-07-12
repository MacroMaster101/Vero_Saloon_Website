import Link from 'next/link';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { requireRole } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { getAvatarInfo } from '@/lib/avatar';
import { signOut } from '@/app/admin/actions';
import { Icon, type IconName } from '@/components/ui/icon';
import { NavLinks } from '@/app/admin/(protected)/nav-links';
import { AdminBottomNav, type AdminNavItem } from '@/app/admin/(protected)/admin-bottom-nav';

// Plain-language nav for the shop owner: every screen reachable from the
// sidebar (desktop) or the 4-tab bar + More sheet (mobile).
const OWNER_NAV: { href: string; label: string; icon: IconName }[] = [
  { href: '/owner', label: 'Home', icon: 'grid' },
  { href: '/owner/account', label: 'Account', icon: 'user' },
  { href: '/owner/bookings', label: 'Bookings', icon: 'calendar' },
  { href: '/owner/my-day', label: 'My day', icon: 'clock' },
  { href: '/owner/services', label: 'Prices & services', icon: 'scissors' },
  { href: '/owner/team', label: 'My team', icon: 'people' },
  { href: '/owner/photos', label: 'Photos', icon: 'grid' },
  { href: '/owner/reviews', label: 'Reviews', icon: 'user' },
  { href: '/owner/time-off', label: 'Days off & blocks', icon: 'lock' },
  { href: '/owner/hours', label: 'Opening hours', icon: 'clock' },
];
const OWNER_PRIMARY: AdminNavItem[] = [
  { href: '/owner', label: 'Home', icon: 'grid' },
  { href: '/owner/bookings', label: 'Bookings', short: 'Bookings', icon: 'calendar' },
  { href: '/owner/my-day', label: 'My day', icon: 'clock' },
  { href: '/owner/team', label: 'My team', short: 'Team', icon: 'people' },
];
const OWNER_OVERFLOW: AdminNavItem[] = [
  { href: '/owner/account', label: 'Account', icon: 'user' },
  { href: '/owner/services', label: 'Prices & services', icon: 'scissors' },
  { href: '/owner/photos', label: 'Photos', icon: 'grid' },
  { href: '/owner/reviews', label: 'Reviews', icon: 'user' },
  { href: '/owner/time-off', label: 'Days off & blocks', icon: 'lock' },
  { href: '/owner/hours', label: 'Opening hours', icon: 'clock' },
];

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole(['owner', 'admin'], '/owner'); // admin allowed for support/preview
  // Same avatar resolution as the site header and staff desk: uploaded photo →
  // Google/email photo → DiceBear fallback (never just an initial).
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  const seed = profile.email ?? profile.fullName ?? 'owner';
  const avatar = getAvatarInfo(user?.user_metadata ?? null, seed).src;

  return (
    <div className="shell shell--admin oshell">
      <aside className="shell__side">
        <Link href="/" className="side__back"><Icon name="arrowLeft" className="ic" /> <span className="side__back-txt">Back to site</span></Link>
        <div className="side__brand"><span className="pole" style={{ height: 26 }} /> Vero Salon
          <span className="role-badge" style={{ marginLeft: 'auto' }}>Owner</span>
        </div>
        {/* Mobile-only theme switch — the desktop one lives in the sidebar footer. */}
        <span className="side__theme"><ThemeToggle /></span>
        {/* The profile card doubles as the shortcut to the Account page —
            on mobile the avatar in the app bar is that same tap target. */}
        <Link href="/owner/account" className="side__id" aria-label="Your account">
          <span className="avatar">
            {/* eslint-disable-next-line @next/next/no-img-element -- remote DiceBear/Google avatars aren't whitelisted for next/image */}
            <img src={avatar} alt="" />
          </span>
          <div className="side__name">{profile.fullName ?? profile.email}</div>
        </Link>
        <NavLinks items={OWNER_NAV} root="/owner" />
        <div className="side__foot">
          <form action={signOut}><button className="btn btn--ghost" type="submit"><Icon name="logout" className="ic" /> Sign out</button></form>
          <ThemeToggle />
        </div>
      </aside>
      <main className="shell__main">{children}</main>
      <AdminBottomNav primary={OWNER_PRIMARY} overflow={OWNER_OVERFLOW} root="/owner" />
    </div>
  );
}
