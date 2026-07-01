'use client';

import { useEffect, useMemo, useState } from 'react';
import { getMonthHolidays } from '@/app/book/actions';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

// Local YYYY-MM-DD for a Y/M/D (no UTC drift — the booking flow is salon-local).
function ymd(y: number, m0: number, d: number): string {
  return `${y}-${String(m0 + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function StepDate({
  selectedDate,
  minDate, // earliest bookable YYYY-MM-DD (today, salon-local)
  maxDate, // latest bookable YYYY-MM-DD (booking horizon)
  onPickDate,
}: {
  selectedDate: string | null;
  minDate: string;
  maxDate: string;
  onPickDate: (date: string) => void;
}) {
  const today = useMemo(() => {
    const [y, m, d] = minDate.split('-').map(Number);
    return { y: y!, m0: m! - 1, d: d! };
  }, [minDate]);

  // Which month is on screen (defaults to the selected date's month, else today's).
  const [view, setView] = useState(() => {
    if (selectedDate) {
      const [y, m] = selectedDate.split('-').map(Number);
      return { y: y!, m0: m! - 1 };
    }
    return { y: today.y, m0: today.m0 };
  });

  const [holidays, setHolidays] = useState<Record<string, string>>({});
  const [loadingHols, setLoadingHols] = useState(false);

  // Fetch SL holidays for the visible month (server action, cached daily). This
  // is an external-data sync effect, so a synchronous loading flag is expected.
  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingHols(true);
    getMonthHolidays(view.y, view.m0)
      .then((map) => { if (!cancelled) setHolidays(map); })
      .finally(() => { if (!cancelled) setLoadingHols(false); });
    return () => { cancelled = true; };
  }, [view.y, view.m0]);

  const firstDow = new Date(Date.UTC(view.y, view.m0, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(view.y, view.m0 + 1, 0)).getUTCDate();

  // Can we page back/forward? Clamp to the [today-month, maxDate-month] range.
  const [maxY, maxM] = maxDate.split('-').map(Number) as [number, number];
  const atMinMonth = view.y === today.y && view.m0 === today.m0;
  const atMaxMonth = view.y === maxY && view.m0 === maxM - 1;

  function shift(delta: number) {
    setView((v) => {
      const d = new Date(Date.UTC(v.y, v.m0 + delta, 1));
      return { y: d.getUTCFullYear(), m0: d.getUTCMonth() };
    });
  }

  const cells: (number | null)[] = [
    ...Array<null>(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="step active" data-step="2">
      <h3 className="step__title">Pick a day</h3>
      <p className="step__hint">Choose your date — holidays are closed and can&apos;t be booked.</p>

      <div className="cal">
        <div className="cal__head">
          <button
            type="button"
            className="cal__nav"
            onClick={() => shift(-1)}
            disabled={atMinMonth}
            aria-label="Previous month"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <span className="cal__title">{MONTHS[view.m0]} {view.y}</span>
          <button
            type="button"
            className="cal__nav"
            onClick={() => shift(1)}
            disabled={atMaxMonth}
            aria-label="Next month"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>

        <div className="cal__grid cal__grid--dow">
          {WEEKDAYS.map((w) => (
            <span key={w} className="cal__dow">{w}</span>
          ))}
        </div>

        <div className="cal__grid" aria-busy={loadingHols}>
          {cells.map((day, i) => {
            if (day === null) return <span key={`e${i}`} className="cal__cell cal__cell--empty" />;
            const value = ymd(view.y, view.m0, day);
            const holiday = holidays[value];
            const isPast = value < minDate;
            const isFuture = value > maxDate;
            const isToday = value === minDate;
            const isSel = selectedDate === value;
            const disabled = isPast || isFuture || Boolean(holiday);
            return (
              <button
                type="button"
                key={value}
                className={
                  'cal__day' +
                  (isSel ? ' sel' : '') +
                  (isToday ? ' today' : '') +
                  (holiday ? ' holiday' : '')
                }
                onClick={() => onPickDate(value)}
                disabled={disabled}
                aria-pressed={isSel}
                title={holiday ?? undefined}
              >
                <span className="cal__daynum">{day}</span>
                {holiday && <span className="cal__dot" aria-hidden="true" />}
              </button>
            );
          })}
        </div>

        <p className="cal__legend">
          <span className="cal__legend-dot" /> Holiday — closed
        </p>
      </div>
    </div>
  );
}
