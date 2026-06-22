'use client';
import { ListToolbar, type FilterChip } from '@/components/admin/list-toolbar';

export interface SchedRow { reference: string; whenLabel: string; timeLabel: string; ampm: string; customer: string; status: string; }
const TAG_CLASS: Record<string, string> = { confirmed: 'tag--confirmed', completed: 'tag--completed', no_show: 'tag--no_show', cancelled: 'tag--cancelled' };

export function ScheduleList({ rows }: { rows: SchedRow[] }) {
  const chips: FilterChip<SchedRow>[] = [
    { id: 'all', label: 'All', match: () => true },
    { id: 'confirmed', label: 'Confirmed', match: (r) => r.status === 'confirmed' },
    { id: 'completed', label: 'Completed', match: (r) => r.status === 'completed' },
    { id: 'cancelled', label: 'Cancelled', match: (r) => r.status === 'cancelled' },
  ];
  return (
    <ListToolbar
      items={rows}
      placeholder="Search customer or ref…"
      searchText={(r) => `${r.customer} ${r.reference}`}
      chips={chips}
      emptyLabel="No appointments match your filters."
      render={(list) => (
        <ul className="bk-list bk-list--grid">
          {list.map((r) => (
            <li key={r.reference} className="bk-card">
              <span className="bk-card__time"><b>{r.timeLabel}</b><span>{r.ampm}</span></span>
              <span className="bk-card__bar" />
              <span className="bk-card__info"><b>{r.customer}</b><span>{r.reference} · {r.whenLabel}</span></span>
              <span className={`tag ${TAG_CLASS[r.status] ?? ''}`} style={{ marginLeft: 'auto' }}>{r.status}</span>
            </li>
          ))}
        </ul>
      )}
    />
  );
}
