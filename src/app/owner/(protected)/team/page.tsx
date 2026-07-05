import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getProfile, requireRole } from '@/lib/supabase/auth';
import { StylistsList } from '@/app/admin/(protected)/stylists/stylists-list';
import { PeopleList } from '@/app/admin/(protected)/people/people-list';
import { InviteStaffForm } from '@/app/admin/(protected)/people/invite-form';
import { Icon } from '@/components/ui/icon';

export default async function OwnerTeamPage() {
  await requireRole(['owner', 'admin'], '/owner/team');
  const profile = await getProfile();
  const sb = await createClient();
  const [{ data: stylists }, { data: profiles }, { data: stylistOptions }] = await Promise.all([
    sb.from('stylists').select('*').order('sort_order'),
    sb.from('profiles').select('id, full_name, email, role, stylist_id').order('created_at', { ascending: true }),
    sb.from('stylists').select('id, name').order('sort_order'),
  ]);
  return (
    <div>
      <Link href="/owner" className="oback"><Icon name="arrowLeft" className="ic" /> Home</Link>
      <h1 className="opage__title">My team</h1>
      <p className="opage__hint">Add or edit stylists, and connect a staff login to their stylist profile.</p>
      <StylistsList stylists={stylists ?? []} />
      <section style={{ marginTop: 32 }}>
        <h2 className="h-section" style={{ fontSize: 18, marginBottom: 10 }}>Staff logins</h2>
        <p className="opage__hint">Make someone &quot;staff&quot; and pick their stylist profile so they can see their own schedule.</p>
        <InviteStaffForm />
        <PeopleList people={profiles ?? []} stylists={stylistOptions ?? []} actorRole={profile?.role ?? 'owner'} />
      </section>
    </div>
  );
}
