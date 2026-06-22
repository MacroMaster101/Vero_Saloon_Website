export type Interval = { startMin: number; endMin: number };

export type ComputeArgs = {
  date: string; // YYYY-MM-DD (local salon day)
  hours: { open_minute: number; close_minute: number; is_closed?: boolean };
  durationMin: number;
  stepMin: number; // grid granularity, e.g. 30
  busy: Interval[]; // booked + blocked intervals in minutes-from-midnight
  tz: string;
};

function overlaps(aStart: number, aEnd: number, b: Interval): boolean {
  return aStart < b.endMin && b.startMin < aEnd;
}

// Returns open start times as 'HH:MM' (24h). Pure + deterministic.
export function computeOpenSlots(args: ComputeArgs): string[] {
  const { hours, durationMin, stepMin, busy } = args;
  if (hours.is_closed) return [];
  const out: string[] = [];
  for (let start = hours.open_minute; start + durationMin <= hours.close_minute; start += stepMin) {
    const end = start + durationMin;
    if (busy.some((b) => overlaps(start, end, b))) continue;
    const h = Math.floor(start / 60), m = start % 60;
    out.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
  return out;
}

// Drop 'HH:MM' start times that have already passed for a given salon-local
// date. `toMs(hhmm)` converts a slot to its UTC epoch ms (injected so this stays
// timezone-pure). For a future date every slot is after `nowMs`, so nothing is
// dropped; for today, slots strictly before `nowMs` are removed (the boundary
// slot where toMs === nowMs is kept).
export function dropPastSlots(
  slots: string[],
  toMs: (hhmm: string) => number,
  nowMs: number,
): string[] {
  return slots.filter((hhmm) => toMs(hhmm) >= nowMs);
}
