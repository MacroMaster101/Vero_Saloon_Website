import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/supabase/auth';
import { getPeopleAvatarMap } from '@/lib/people-avatars';
import { StylistsList } from '@/app/admin/(protected)/stylists/stylists-list';
import { PeopleList } from '@/app/admin/(protected)/people/people-list';
import { InviteStaffForm } from '@/app/admin/(protected)/people/invite-form';
import { Icon } from '@/components/ui/icon';
import { LoadError } from '@/components/admin/load-error';

export default async function OwnerTeamPage() {
  // requireRole already returns the profile — calling getProfile() again would
  // re-run the same query, and its `?? 'owner'` fallback would mislabel an admin.
  const profile = await requireRole(['owner', 'admin'], '/owner/team');
  const sb = await createClient();
  const [{ data: stylists, error: stylistErr }, { data: profiles, error: peopleErr }, avatars] = await Promise.all([
    sb.from('stylists').select('*').order('sort_order'),
    // Only the owner's remit (see lib/auth/role-rules.ts): admin/owner rows are
    // deliberately excluded. The RLS policy "owner read profiles" (0011) permits
    // selecting every profile, so without this filter admin and owner names +
    // EMAILS would be serialized into this page for the owner's browser.
    sb.from('profiles').select('id, full_name, email, role, stylist_id')
      .in('role', ['user', 'staff']).order('created_at', { ascending: true }),
    getPeopleAvatarMap(),
  ]);
  // The role form's dropdown is the same stylist list, narrowed — no second query.
  const stylistOptions = (stylists ?? []).map(({ id, name }) => ({ id, name }));
  const people = (profiles ?? []).map((p) => ({ ...p, avatar_src: avatars[p.id] }));
  return (
    <div>
      <Link href="/owner" className="oback"><Icon name="arrowLeft" className="ic" /> Home</Link>
      <h1 className="opage__title">My team</h1>
      <p className="opage__hint">Add or edit stylists, and connect a staff login to their stylist profile.</p>
      <LoadError what="stylists" error={stylistErr} />
      <StylistsList stylists={stylists ?? []} />
      <section style={{ marginTop: 24 }}>
        <h2 className="h-section" style={{ fontSize: 18, marginBottom: 10 }}>Staff logins</h2>
        <p className="opage__hint">Make someone &quot;staff&quot; and pick their stylist profile so they can see their own schedule.</p>
        <InviteStaffForm />
        <LoadError what="staff logins" error={peopleErr} />
        {!peopleErr && !stylistErr && (
          <PeopleList people={people} stylists={stylistOptions} actorRole={profile.role} />
        )}
      </section>
    </div>
  );
}
