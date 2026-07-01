'use client';
import { useActionState } from 'react';
import { syncHolidays, addManualHoliday } from '@/app/admin/(protected)/holidays/holiday-actions';

const THIS_YEAR = new Date().getFullYear();
const YEARS = [THIS_YEAR, THIS_YEAR + 1];

export function HolidayForms() {
  const [syncState, syncAction, syncing] = useActionState(
    async (_prev: unknown, fd: FormData) => syncHolidays(fd),
    undefined as undefined | { error: string } | { ok: true; count: number },
  );
  const [addState, addAction, adding] = useActionState(
    async (_prev: unknown, fd: FormData) => addManualHoliday(fd),
    undefined as undefined | { error: string } | { ok: true },
  );

  return (
    <div className="atwo" style={{ marginTop: 20, alignItems: 'start' }}>
      {/* Sync from Google */}
      <form action={syncAction} className="acard">
        <div className="acard__title">Sync from Google</div>
        <p className="lead" style={{ margin: '0 0 14px', fontSize: 14 }}>
          Pull Sri Lankan public &amp; poya holidays for a year. Safe to re-run — it refreshes existing entries.
        </p>
        <label className="afield">
          <span className="alabel">Year</span>
          <select name="year" defaultValue={THIS_YEAR} className="ainput">
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </label>
        {syncState && 'error' in syncState && <p className="astatus astatus--err">{syncState.error}</p>}
        {syncState && 'ok' in syncState && <p className="astatus astatus--ok">Synced {syncState.count} holidays.</p>}
        <button className="btn btn--primary" disabled={syncing}>
          {syncing ? 'Syncing…' : 'Sync holidays'}
        </button>
      </form>

      {/* Add manual closure */}
      <form action={addAction} className="acard">
        <div className="acard__title">Add a closure by hand</div>
        <p className="lead" style={{ margin: '0 0 14px', fontSize: 14 }}>
          For a salon-specific closed day that isn&apos;t a public holiday.
        </p>
        <label className="afield">
          <span className="alabel">Date</span>
          <input name="date" type="date" required className="ainput" />
        </label>
        <label className="afield">
          <span className="alabel">Name</span>
          <input name="name" type="text" required placeholder="e.g. Staff training day" className="ainput" />
        </label>
        {addState && 'error' in addState && <p className="astatus astatus--err">{addState.error}</p>}
        {addState && 'ok' in addState && <p className="astatus astatus--ok">Added.</p>}
        <button className="btn btn--primary" disabled={adding}>
          {adding ? 'Adding…' : 'Add closure'}
        </button>
      </form>
    </div>
  );
}
