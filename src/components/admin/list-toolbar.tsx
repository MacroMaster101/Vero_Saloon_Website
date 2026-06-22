'use client';
import { useMemo, useState, type ReactNode } from 'react';
import { Icon } from '@/components/ui/icon';

export interface FilterChip<T> {
  id: string;
  label: string;
  match: (item: T) => boolean; // 'all' chip should match everything
}

export function ListToolbar<T>({
  items, searchText, placeholder, chips, render, emptyLabel = 'Nothing matches your filters.',
}: {
  items: T[];
  searchText: (item: T) => string;     // searchable string for an item
  placeholder: string;
  chips: FilterChip<T>[];              // first chip is the default ("All")
  render: (filtered: T[]) => ReactNode;
  emptyLabel?: string;
}) {
  const [q, setQ] = useState('');
  const [active, setActive] = useState(chips[0]?.id);
  const chip = chips.find((c) => c.id === active) ?? chips[0];

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((it) => {
      const okText = !needle || searchText(it).toLowerCase().includes(needle);
      const okChip = !chip || chip.match(it);
      return okText && okChip;
    });
  }, [items, q, chip, searchText]);

  return (
    <>
      <div className="toolbar">
        <div className="search">
          <Icon name="search" className="ic" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} aria-label="Search" />
        </div>
        <div className="chips" role="group" aria-label="Filters">
          {chips.map((c) => (
            <button key={c.id} type="button" className={`chip${c.id === active ? ' on' : ''}`} onClick={() => setActive(c.id)}>
              {c.label}
            </button>
          ))}
        </div>
        <span className="count">{filtered.length} shown</span>
      </div>
      {filtered.length === 0 ? <p className="lead" style={{ opacity: 0.7 }}>{emptyLabel}</p> : render(filtered)}
    </>
  );
}
