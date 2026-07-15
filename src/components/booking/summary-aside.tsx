'use client';
import { useEffect, useRef, useState } from 'react';
import type { Service } from '@/lib/supabase/types';
import { money } from '@/lib/format';
import { t } from '@/lib/i18n/translations';

/** Removable chips for the services in the combined booking. */
function ServiceChips({
  chips,
  onRemove,
}: {
  chips: Service[];
  onRemove?: (id: string) => void;
}) {
  if (chips.length === 0) return null;
  return (
    <div className="sum-chips">
      {chips.map((s) => (
        <span key={s.id} className="sum-chip">
          <span className="sum-chip__name">{s.name}</span>
          {onRemove && (
            <button
              type="button"
              className="sum-chip__x"
              aria-label={`Remove ${s.name}`}
              onClick={() => onRemove(s.id)}
            >
              ×
            </button>
          )}
        </span>
      ))}
    </div>
  );
}

export function SummaryAside({
  service,
  stylistLabel,
  whenLabel,
  variant = 'full',
  chips = [],
  onRemoveService,
  locale = 'en',
}: {
  service: Service | null;
  /** null = not chosen yet, otherwise the label ("Any available" / a name) */
  stylistLabel: string | null;
  whenLabel: string | null;
  variant?: 'full' | 'bar';
  /** The services in the combined booking, shown as removable chips. */
  chips?: Service[];
  /** When provided, chips get an × to deselect (only on the service step). */
  onRemoveService?: (id: string) => void;
  locale?: string;
}) {
  if (variant === 'bar') {
    return (
      <SummaryBar
        service={service}
        stylistLabel={stylistLabel}
        whenLabel={whenLabel}
        chips={chips}
        onRemoveService={onRemoveService}
        locale={locale}
      />
    );
  }
  return (
    <aside className="book__aside">
      <span className="eyebrow gold summary__eyebrow">{t('Your appointment', locale)}</span>
      <div className="summary__title">Vero Salon</div>
      <div className="sum-row">
        <span className="k">{chips.length > 1 ? t('Services', locale) : t('Service', locale)}</span>
        <span className={`v${service ? '' : ' empty'}`} id="sm-service">
          {service ? service.name : t('Not selected', locale)}
        </span>
      </div>
      <ServiceChips chips={chips} onRemove={onRemoveService} />
      <div className="sum-row">
        <span className="k">{t('Stylist', locale)}</span>
        <span className={`v${stylistLabel ? '' : ' empty'}`} id="sm-barber">
          {stylistLabel ?? t('Any available', locale)}
        </span>
      </div>
      <div className="sum-row">
        <span className="k">{t('When', locale)}</span>
        <span className={`v${whenLabel ? '' : ' empty'}`} id="sm-when">
          {whenLabel ?? t('Pick a time', locale)}
        </span>
      </div>
      <div className="sum-total">
        <span className="k">{t('Total', locale)}</span>
        <span className="v" id="sm-total">
          {money(service?.price_lkr ?? 0)}
        </span>
      </div>
      <p className="summary__note">
        {t('Pay at the salon, cash or card. Free cancellation up to 2 hours before your slot — just give us a call.', locale)}
      </p>
    </aside>
  );
}

// Mobile sticky summary bar. Two ways to get it out of the way of a long form:
//   • auto-hide: it slides up when you scroll down into the content, slides back
//     when you scroll up (standard mobile pattern);
//   • manual: a chevron collapses it to a thin total-only line, and that choice
//     sticks until tapped again.
// When manually collapsed, auto-hide is suppressed (a slim line never blocks
// much, and the user asked for it to stay).
function SummaryBar({
  service,
  stylistLabel,
  whenLabel,
  chips,
  onRemoveService,
  locale = 'en',
}: {
  service: Service | null;
  stylistLabel: string | null;
  whenLabel: string | null;
  chips: Service[];
  onRemoveService?: (id: string) => void;
  locale?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);     // auto-hidden by scroll-down
  const [collapsed, setCollapsed] = useState(false); // manual thin-line mode
  const hasSel = chips.length > 0;

  useEffect(() => {
    // The scroll container is the modal body (this bar's scrolling ancestor).
    const scroller = ref.current?.closest('.home-modal__body') as HTMLElement | null;
    if (!scroller) return;
    let last = scroller.scrollTop;
    const onScroll = () => {
      const y = scroller.scrollTop;
      const dy = y - last;
      // Ignore tiny jitters; hide when scrolling down past a little, show on up.
      if (Math.abs(dy) > 6) {
        setHidden(dy > 0 && y > 40);
        last = y;
      }
    };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => scroller.removeEventListener('scroll', onScroll);
  }, []);

  const isHidden = hidden && !collapsed;
  const cls =
    'book__bar' +
    (isHidden ? ' book__bar--hidden' : '') +
    (collapsed ? ' book__bar--collapsed' : '');

  const getCountText = () => {
    if (!hasSel) return t('Select a service to start', locale);
    if (chips.length === 1) return `1 ${t('Service', locale).toLowerCase()}`;
    return `${chips.length} ${t('Services', locale).toLowerCase()}`;
  };

  return (
    <div className={cls} ref={ref}>
      <div className="book__bar-head">
        <span className="book__bar-label">
          <span className="eyebrow-sm">{t('Your visit', locale)}</span>
          <span className="count">{getCountText()}</span>
        </span>
        <span className="book__bar-total">{money(service?.price_lkr ?? 0)}</span>
        {/* Chevron: collapse to a thin total line / expand back. */}
        <button
          type="button"
          className="book__bar-toggle"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? t('Show appointment details', locale) : t('Hide appointment details', locale)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>
      {/* Everything below the head row hides when collapsed. */}
      <div className="book__bar-body">
        {hasSel && <ServiceChips chips={chips} onRemove={onRemoveService} />}
        {stylistLabel && (
          <div className="book__bar-meta">
            <span className="book__bar-metaitem">
              <span className="k">{t('Stylist', locale)}</span>
              <span className="v">{stylistLabel}</span>
            </span>
            <span className="book__bar-metaitem">
              <span className="k">{t('When', locale)}</span>
              <span className={`v${whenLabel ? '' : ' empty'}`}>{whenLabel ?? t('Pick a time', locale)}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
