import { requireRole } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { PeopleList } from './people-list';

export default async function PeoplePage() {
  await requireRole(['admin'], '/admin/people');
  const sb = await createClient();
  const { data: profiles } = await sb.from('profiles').select('id, full_name, email, role, stylist_id').order('created_at', { ascending: true });
  const { data: stylists } = await sb.from('stylists').select('id, name').order('sort_order');
  return (
    <div className="apage">
      <div className="ahead">
        <div>
          <span className="eyebrow">Team &amp; access</span>
          <h1 className="ahead__title">People</h1>
        </div>
      </div>
      <PeopleList people={profiles ?? []} stylists={stylists ?? []} />
    </div>
  );
}
