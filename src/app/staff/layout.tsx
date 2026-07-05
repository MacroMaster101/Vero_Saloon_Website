import Link from 'next/link';
import { requireRole } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { getAvatarInfo } from '@/lib/avatar';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { signOut } from '@/app/admin/actions';
import { Icon, type IconName } from '@/components/ui/icon';
import { NavLinks } from '@/app/admin/(protected)/nav-links';
import { AdminBottomNav, type AdminNavItem } from '@/app/admin/(protected)/admin-bottom-nav';

const STAFF_NAV: { href: string; label: string; icon: IconName }[] = [
  { href: '/staff', label: 'Today', icon: 'grid' },
  { href: '/staff/schedule', label: 'My week', icon: 'calendar' },
  { href: '/staff/account', label: 'Account', icon: 'user' },
];
const STAFF_PRIMARY: AdminNavItem[] = [
  { href: '/staff', label: 'Today', icon: 'grid' },
  { href: '/staff/schedule', label: 'My week', short: 'Week', icon: 'calendar' },
  { href: '/staff/account', label: 'Account', icon: 'user' },
];

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole(['staff', 'admin', 'owner'], '/staff');

  const sb = await createClient();
  const [{ data: { user } }, { data: stylist }] = await Promise.all([
    sb.auth.getUser(),
    profile.stylistId
      ? sb.from('stylists').select('name, role').eq('id', profile.stylistId).single()
      : Promise.resolve({ data: null }),
  ]);
  const seed = profile.email ?? profile.fullName ?? 'staff';
  const avatar = getAvatarInfo(user?.user_metadata ?? null, seed).src;

  return (
    <div className="shell shell--admin">
      <aside className="shell__side">
        <Link href="/" className="side__back"><Icon name="arrowLeft" className="ic" /> Back to site</Link>
        <div className="side__brand">
          <span className="pole" style={{ height: 26 }} /> Vero Salon
          <span className="role-badge" style={{ marginLeft: 'auto' }}>Staff</span>
        </div>
        <div className="side__id sd-id">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatar} alt="" className="sd-id__photo" />
          <div>
            <div className="side__name">{profile.fullName ?? profile.email}</div>
            {stylist && <div className="sd-id__chair">{stylist.role || 'Stylist'}</div>}
          </div>
        </div>
        <NavLinks items={STAFF_NAV} root="/staff" />
        <div className="side__foot">
          <form action={signOut}><button className="btn btn--ghost" type="submit"><Icon name="logout" className="ic" /> Sign out</button></form>
          <ThemeToggle />
        </div>
      </aside>
      <main className="shell__main">{children}</main>
      <AdminBottomNav primary={STAFF_PRIMARY} overflow={[]} root="/staff" />
    </div>
  );
}
