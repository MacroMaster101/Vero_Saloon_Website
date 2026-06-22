'use client';
import { ListToolbar, type FilterChip } from '@/components/admin/list-toolbar';
import { setRole, adminDeleteUser } from './actions';

export interface Person { id: string; full_name: string | null; email: string | null; role: string; stylist_id: string | null; }
export interface Stylist { id: string; name: string; }

export function PeopleList({ people, stylists }: { people: Person[]; stylists: Stylist[] }) {
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
            const initial = (p.full_name || p.email || '?').trim().charAt(0).toUpperCase();
            return (
              <li key={p.id} className="person">
                <div className="person__id">
                  <span className="avatar" style={{ width: 38, height: 38 }}><b style={{ fontSize: 14 }}>{initial}</b></span>
                  <div><b style={{ fontSize: 14 }}>{p.full_name ?? '—'}</b><div className="step__hint" style={{ margin: 0 }}>{p.email}</div></div>
                </div>
                <form action={setRole} className="person__edit">
                  <input type="hidden" name="id" value={p.id} />
                  <select name="role" defaultValue={p.role} aria-label="Role">
                    <option value="user">user</option><option value="staff">staff</option><option value="admin">admin</option>
                  </select>
                  <select name="stylist_id" defaultValue={p.stylist_id ?? ''} aria-label="Linked stylist">
                    <option value="">— no stylist —</option>
                    {stylists.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <button className="btn btn--primary" type="submit">Save</button>
                </form>
                <form action={adminDeleteUser} className="person__del">
                  <input type="hidden" name="id" value={p.id} />
                  <button type="submit" className="btn btn--danger-outline">Delete</button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    />
  );
}
