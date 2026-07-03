import Link from 'next/link';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { requireRole } from '@/lib/supabase/auth';
import { signOut } from '@/app/admin/actions';
import { Icon, type IconName } from '@/components/ui/icon';
import { NavLinks } from '@/app/admin/(protected)/nav-links';
import { AdminBottomNav, type AdminNavItem } from '@/app/admin/(protected)/admin-bottom-nav';

// Plain-language nav for the shop owner: every screen reachable from the
// sidebar (desktop) or the 4-tab bar + More sheet (mobile).
const OWNER_NAV: { href: string; label: string; icon: IconName }[] = [
  { href: '/owner', label: 'Home', icon: 'grid' },
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
  { href: '/owner/services', label: 'Prices & services', icon: 'scissors' },
  { href: '/owner/photos', label: 'Photos', icon: 'grid' },
  { href: '/owner/reviews', label: 'Reviews', icon: 'user' },
  { href: '/owner/time-off', label: 'Days off & blocks', icon: 'lock' },
  { href: '/owner/hours', label: 'Opening hours', icon: 'clock' },
];

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole(['owner', 'admin'], '/owner'); // admin allowed for support/preview
  const initial = (profile.fullName || profile.email || '?').trim().charAt(0).toUpperCase();

  return (
    <div className="shell shell--admin oshell">
      <aside className="shell__side">
        <Link href="/" className="side__back"><Icon name="arrowLeft" className="ic" /> Back to site</Link>
        <div className="side__brand"><span className="pole" style={{ height: 26 }} /> Vero Salon
          <span className="role-badge" style={{ marginLeft: 'auto' }}>Owner</span>
        </div>
        <div className="side__id">
          <span className="avatar"><b>{initial}</b></span>
          <div className="side__name">{profile.fullName ?? profile.email}</div>
        </div>
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
