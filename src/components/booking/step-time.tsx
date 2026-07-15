'use client';
import { t } from '@/lib/i18n/translations';

function timeLabel(hhmm: string, locale: string = 'en'): string {
  const [h, m] = hhmm.split(':').map(Number) as [number, number];
  const period = h < 12 
    ? (locale === 'si' ? 'පෙ.ව.' : 'AM')
    : (locale === 'si' ? 'ප.ව.' : 'PM');
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
  locale = 'en',
}: {
  /** Human label for the chosen day, e.g. "Mon, 7 Jul". */
  dateLabel: string | null;
  slots: string[];
  loading: boolean;
  selectedTime: string | null;
  onPickTime: (time: string) => void;
  locale?: string;
}) {
  return (
    <div className="step active" data-step="3">
      <h3 className="step__title">{t('Pick a time', locale)}</h3>
      <p className="step__hint">
        {dateLabel 
          ? `${t('Openings for', locale)} ${dateLabel} — `
          : ''
        }{t("times shown are this stylist's openings.", locale)}
      </p>
      <div className="slots" id="slotList">
        {loading ? (
          <p className="step__hint" style={{ gridColumn: '1 / -1', margin: 0 }}>{t('Loading times…', locale)}</p>
        ) : slots.length === 0 ? (
          <p className="step__hint" style={{ gridColumn: '1 / -1', margin: 0 }}>
            {t('No open times on this day — go back and try another date.', locale)}
          </p>
        ) : (
          slots.map((tVal) => (
            <button
              type="button"
              key={tVal}
              className={`slot${selectedTime === tVal ? ' sel' : ''}`}
              onClick={() => onPickTime(tVal)}
              aria-pressed={selectedTime === tVal}
            >
              {timeLabel(tVal, locale)}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
