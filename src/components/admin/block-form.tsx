'use client';
import { useActionState } from 'react';
import { createBlock } from '@/app/admin/(protected)/blocked-slots/block-actions';
import { minutesToLabel } from '@/lib/format';
import type { Stylist } from '@/lib/supabase/types';

function rangeOptions(from: number, to: number): number[] {
  const out: number[] = [];
  for (let m = from; m <= to; m += 30) out.push(m);
  return out;
}

const START_OPTIONS = rangeOptions(600, 1410);
const END_OPTIONS = rangeOptions(630, 1440);

export function BlockForm({ stylists }: { stylists: Stylist[] }) {
  const [state, action, pending] = useActionState(
    async (_prev: unknown, fd: FormData) => createBlock(fd),
    undefined as undefined | { error: string } | { ok: true },
  );

  return (
    <form action={action} className="acard" style={{ marginTop: 20 }}>
      <div className="acard__title">Add a block</div>

      <label className="afield">
        <span className="alabel">Stylist</span>
        <select name="stylistId" defaultValue="all" className="ainput">
          <option value="all">Whole salon</option>
          {stylists.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </label>

      <label className="afield">
        <span className="alabel">Date</span>
        <input name="date" type="date" required className="ainput" />
      </label>

      <div className="atwo">
        <label className="afield">
          <span className="alabel">Start</span>
          <select name="startMin" defaultValue={600} className="ainput">
            {START_OPTIONS.map((m) => (
              <option key={m} value={m}>{minutesToLabel(m)}</option>
            ))}
          </select>
        </label>
        <label className="afield">
          <span className="alabel">End</span>
          <select name="endMin" defaultValue={630} className="ainput">
            {END_OPTIONS.map((m) => (
              <option key={m} value={m}>{minutesToLabel(m)}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="afield">
        <span className="alabel">Reason (optional)</span>
        <input name="reason" type="text" placeholder="e.g. Holiday, training" className="ainput" />
      </label>

      {state && 'error' in state && (
        <p className="astatus astatus--err">{state.error}</p>
      )}

      <button className="btn btn--primary" disabled={pending}>
        {pending ? 'Adding…' : 'Add block'}
      </button>
    </form>
  );
}
