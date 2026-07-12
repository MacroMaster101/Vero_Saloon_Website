import { requireRole } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { getPeopleAvatarMap } from '@/lib/people-avatars';
import { PeopleList } from './people-list';
import { InviteStaffForm } from './invite-form';

export default async function PeoplePage() {
  const profile = await requireRole(['admin'], '/admin/people');
  const sb = await createClient();
  const [{ data: profiles }, { data: stylists }, avatars] = await Promise.all([
    sb.from('profiles').select('id, full_name, email, role, stylist_id').order('created_at', { ascending: true }),
    sb.from('stylists').select('id, name').order('sort_order'),
    getPeopleAvatarMap(),
  ]);
  const people = (profiles ?? []).map((p) => ({ ...p, avatar_src: avatars[p.id] }));
  return (
    <div className="apage">
      <div className="ahead">
        <div>
          <span className="eyebrow">Team &amp; access</span>
          <h1 className="ahead__title">People</h1>
        </div>
      </div>
      <InviteStaffForm />
      <PeopleList people={people} stylists={stylists ?? []} actorRole={profile.role} />
    </div>
  );
}
