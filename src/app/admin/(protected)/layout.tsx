import Link from 'next/link';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { requireRole } from '@/lib/supabase/auth';
import { signOut } from '../actions';
import { Icon, type IconName } from '@/components/ui/icon';
import { NavLinks } from './nav-links';
import { AdminBottomNav, type AdminNavItem } from './admin-bottom-nav';

const ADMIN_NAV: { href: string; label: string; icon: IconName }[] = [
  { href: '/admin', label: 'Dashboard', icon: 'grid' },
  { href: '/admin/people', label: 'People', icon: 'people' },
  { href: '/admin/services', label: 'Services', icon: 'scissors' },
  { href: '/admin/stylists', label: 'Stylists', icon: 'user' },
  { href: '/admin/gallery', label: 'Gallery', icon: 'grid' },
  { href: '/admin/reviews', label: 'Reviews', icon: 'user' },
  { href: '/admin/content', label: 'Content', icon: 'cog' },
  { href: '/admin/schedule', label: 'Schedule', icon: 'calendar' },
];
// Mobile bottom-nav split: up to 5 primary tabs in the bar, the rest go to "More".
const ADMIN_PRIMARY: AdminNavItem[] = [
  { href: '/admin', label: 'Dashboard', short: 'Home', icon: 'grid' },
  { href: '/admin/people', label: 'People', icon: 'people' },
  { href: '/admin/services', label: 'Services', short: 'Serv', icon: 'scissors' },
  { href: '/admin/schedule', label: 'Schedule', short: 'Sched', icon: 'calendar' },
];
const ADMIN_OVERFLOW: AdminNavItem[] = [
  { href: '/admin/stylists', label: 'Stylists', icon: 'user' },
  { href: '/admin/gallery', label: 'Gallery', icon: 'grid' },
  { href: '/admin/reviews', label: 'Reviews', icon: 'user' },
  { href: '/admin/content', label: 'Content', icon: 'cog' },
];

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole(['admin'], '/admin');
  const nav = ADMIN_NAV;
  const btmPrimary = ADMIN_PRIMARY;
  const btmOverflow = ADMIN_OVERFLOW;
  const initial = (profile.fullName || profile.email || '?').trim().charAt(0).toUpperCase();

  return (
    <div className="shell shell--admin">
      <aside className="shell__side">
        <Link href="/" className="side__back"><Icon name="arrowLeft" className="ic" /> Back to site</Link>
        <div className="side__brand"><span className="pole" style={{ height: 26 }} /> Vero Salon
          <span className="role-badge" style={{ marginLeft: 'auto' }}>Admin</span>
        </div>
        <div className="side__id">
          <span className="avatar"><b>{initial}</b></span>
          <div className="side__name">{profile.fullName ?? profile.email}</div>
        </div>
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
