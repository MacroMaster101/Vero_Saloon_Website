import Link from 'next/link';
import { requireRole } from '@/lib/supabase/auth';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { signOut } from '@/app/admin/actions';
import { Icon, type IconName } from '@/components/ui/icon';
import { StaffNavLinks } from './nav-links';

const STAFF_NAV: { href: string; label: string; icon: IconName }[] = [
  { href: '/staff', label: 'Today', icon: 'grid' },
  { href: '/staff/schedule', label: 'My schedule', icon: 'calendar' },
  { href: '/staff/account', label: 'Account', icon: 'user' },
];

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole(['staff', 'admin'], '/staff');
  const initial = (profile.fullName || profile.email || '?').trim().charAt(0).toUpperCase();

  return (
    <div className="shell shell--admin">
      <aside className="shell__side">
        <Link href="/" className="side__back"><Icon name="arrowLeft" className="ic" /> Back to site</Link>
        <div className="side__brand">
          <span className="pole" style={{ height: 26 }} /> Vero Salon
          <span className="role-badge" style={{ marginLeft: 'auto' }}>Staff</span>
        </div>
        <div className="side__id">
          <span className="avatar"><b>{initial}</b></span>
          <div className="side__name">{profile.fullName ?? profile.email}</div>
        </div>
        <StaffNavLinks items={STAFF_NAV} />
        <div className="side__foot">
          <form action={signOut}><button className="btn btn--ghost" type="submit"><Icon name="logout" className="ic" /> Sign out</button></form>
          <ThemeToggle />
        </div>
      </aside>
      <main className="shell__main">{children}</main>
    </div>
  );
}
