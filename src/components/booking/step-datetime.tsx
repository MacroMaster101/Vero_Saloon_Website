'use client';

export interface DateChip {
  value: string; // YYYY-MM-DD
  dow: string; // "Today" | "Mon" ...
  dom: string; // day-of-month
}

function timeLabel(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number) as [number, number];
  const period = h < 12 ? 'AM' : 'PM';
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

export function StepDateTime({
  dates,
  selectedDate,
  slots,
  loading,
  selectedTime,
  onPickDate,
  onPickTime,
}: {
  dates: DateChip[];
  selectedDate: string | null;
  slots: string[];
  loading: boolean;
  selectedTime: string | null;
  onPickDate: (date: string) => void;
  onPickTime: (time: string) => void;
}) {
  return (
    <div className="step active" data-step="2">
      <h3 className="step__title">When works for you?</h3>
      <p className="step__hint">Pick a day, then a time slot. Times shown are this stylist&apos;s openings.</p>
      <div className="date-row" id="dateRow">
        {dates.map((d) => (
          <button
            type="button"
            key={d.value}
            className={`date-chip${selectedDate === d.value ? ' sel' : ''}`}
            onClick={() => onPickDate(d.value)}
            aria-pressed={selectedDate === d.value}
          >
            <span className="dow">{d.dow}</span>
            <span className="dom">{d.dom}</span>
          </button>
        ))}
      </div>
      <div className="slots" id="slotList">
        {loading ? (
          <p className="step__hint" style={{ gridColumn: '1 / -1', margin: 0 }}>
            Loading times…
          </p>
        ) : !selectedDate ? (
          <p className="step__hint" style={{ gridColumn: '1 / -1', margin: 0 }}>
            Pick a day to see open times.
          </p>
        ) : slots.length === 0 ? (
          <p className="step__hint" style={{ gridColumn: '1 / -1', margin: 0 }}>
            No open times — try another day.
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
