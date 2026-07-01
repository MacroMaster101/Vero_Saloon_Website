'use client';

function timeLabel(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number) as [number, number];
  const period = h < 12 ? 'AM' : 'PM';
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

export function StepTime({
  dateLabel,
  slots,
  loading,
  selectedTime,
  onPickTime,
}: {
  /** Human label for the chosen day, e.g. "Mon, 7 Jul". */
  dateLabel: string | null;
  slots: string[];
  loading: boolean;
  selectedTime: string | null;
  onPickTime: (time: string) => void;
}) {
  return (
    <div className="step active" data-step="3">
      <h3 className="step__title">Pick a time</h3>
      <p className="step__hint">
        {dateLabel ? `Openings for ${dateLabel} — ` : ''}times shown are this stylist&apos;s openings.
      </p>
      <div className="slots" id="slotList">
        {loading ? (
          <p className="step__hint" style={{ gridColumn: '1 / -1', margin: 0 }}>Loading times…</p>
        ) : slots.length === 0 ? (
          <p className="step__hint" style={{ gridColumn: '1 / -1', margin: 0 }}>
            No open times on this day — go back and try another date.
          </p>
        ) : (
          slots.map((t) => (
            <button
              type="button"
              key={t}
              className={`slot${selectedTime === t ? ' sel' : ''}`}
              onClick={() => onPickTime(t)}
              aria-pressed={selectedTime === t}
            >
              {timeLabel(t)}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
