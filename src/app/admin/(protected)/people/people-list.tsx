'use client';
import { useActionState } from 'react';
import { ListToolbar, type FilterChip } from '@/components/admin/list-toolbar';
import { SubmitButton, FormStatus, DeleteForm } from '@/components/admin/form-kit';
import { CardImg } from '@/components/admin/media-card';
import { setRole, adminDeleteUser } from './actions';
import { assignableRoles, canSetRole } from '@/lib/auth/role-rules';
import { dicebearUrl } from '@/lib/avatar';
import type { Role } from '@/lib/auth/roles';

export interface Person {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  stylist_id: string | null;
  /** Resolved avatar URL (auth metadata via service role); DiceBear fallback when absent. */
  avatar_src?: string;
}
export interface Stylist { id: string; name: string; }

function RoleForm({ p, stylists, actorRole }: { p: Person; stylists: Stylist[]; actorRole: Role }) {
  const [state, action, pending] = useActionState(
    async (_prev: unknown, fd: FormData) => setRole(fd),
    undefined as undefined | { error: string } | { ok: true },
  );
  return (
    <form action={action} className="person__edit">
      <input type="hidden" name="id" value={p.id} />
      <select name="role" defaultValue={p.role} aria-label="Role">
        {assignableRoles(actorRole).map((r) => <option key={r} value={r}>{r}</option>)}
      </select>
      <select name="stylist_id" defaultValue={p.stylist_id ?? ''} aria-label="Linked stylist">
        <option value="">— no stylist —</option>
        {stylists.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      <SubmitButton pending={pending} />
      <FormStatus state={state} />
    </form>
  );
}

export function PeopleList({ people, stylists, actorRole }: { people: Person[]; stylists: Stylist[]; actorRole: Role }) {
  const chips: FilterChip<Person>[] = [
    { id: 'all', label: 'All', match: () => true },
    { id: 'admin', label: 'Admin', match: (p) => p.role === 'admin' },
    { id: 'staff', label: 'Staff', match: (p) => p.role === 'staff' },
    { id: 'user', label: 'User', match: (p) => p.role === 'user' },
  ];
  return (
    <ListToolbar
      items={people}
      placeholder="Search name or email…"
      searchText={(p) => `${p.full_name ?? ''} ${p.email ?? ''}`}
      chips={chips}
      emptyLabel="No people match your filters."
      render={(rows) => (
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 10 }}>
          {rows.map((p) => {
            const fallback = dicebearUrl(p.email ?? p.full_name);
            const canTouch = canSetRole(actorRole, p.role as Role, p.role as Role);
            return (
              <li key={p.id} className="person">
                <div className="person__id">
                  <span className="avatar" style={{ width: 38, height: 38 }}>
                    <CardImg src={p.avatar_src ?? fallback} fallbackSrc={fallback} alt="" />
                  </span>
                  <div><b style={{ fontSize: 14 }}>{p.full_name ?? '—'}</b><div className="step__hint" style={{ margin: 0 }}>{p.email}</div></div>
                </div>
                {canTouch ? (
                  <RoleForm p={p} stylists={stylists} actorRole={actorRole} />
                ) : (
                  <span className="role-badge">{p.role}</span>
                )}
                {canTouch && actorRole === 'admin' && (
                  <div className="person__del">
                    <DeleteForm
                      action={adminDeleteUser}
                      id={p.id}
                      confirm={`Delete ${p.full_name ?? p.email ?? 'this user'} and anonymize their bookings? Their linked stylist card is removed too (hidden instead if it has booking history). This cannot be undone.`}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    />
  );
}
