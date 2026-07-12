'use client';
import type { ViewMode } from './use-view-mode';

const common = {
  width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 2,
  strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
};

/** Card/row switch shown in the list toolbar. */
export function ViewToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  return (
    <span className="vtoggle" role="group" aria-label="List layout">
      <button
        type="button"
        className={mode === 'cards' ? 'on' : undefined}
        aria-pressed={mode === 'cards'}
        title="Card view"
        onClick={() => onChange('cards')}
      >
        <svg {...common} aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
      </button>
      <button
        type="button"
        className={mode === 'rows' ? 'on' : undefined}
        aria-pressed={mode === 'rows'}
        title="List view"
        onClick={() => onChange('rows')}
      >
        <svg {...common} aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>
    </span>
  );
}
