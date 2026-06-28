'use client';
import type { Service } from '@/lib/supabase/types';
import { money } from '@/lib/format';

export function SummaryAside({
  service,
  stylistLabel,
  whenLabel,
  variant = 'full',
}: {
  service: Service | null;
  /** null = not chosen yet, otherwise the label ("Any available" / a name) */
  stylistLabel: string | null;
  whenLabel: string | null;
  variant?: 'full' | 'bar';
}) {
  if (variant === 'bar') {
    return (
      <div className="book__bar">
        <div className="book__bar-info">
          <b>{service ? service.name : 'Select a service'}</b>
          <small>{stylistLabel ?? 'Any available'} · {whenLabel ?? 'pick a time'}</small>
        </div>
        <div className="book__bar-total">{money(service?.price_lkr ?? 0)}</div>
      </div>
    );
  }
  return (
    <aside className="book__aside">
      <span className="eyebrow gold summary__eyebrow">Your appointment</span>
      <div className="summary__title">Vero Salon</div>
      <div className="sum-row">
        <span className="k">Service</span>
        <span className={`v${service ? '' : ' empty'}`} id="sm-service">
          {service ? service.name : 'Not selected'}
        </span>
      </div>
      <div className="sum-row">
        <span className="k">Stylist</span>
        <span className={`v${stylistLabel ? '' : ' empty'}`} id="sm-barber">
          {stylistLabel ?? 'Any available'}
        </span>
      </div>
      <div className="sum-row">
        <span className="k">When</span>
        <span className={`v${whenLabel ? '' : ' empty'}`} id="sm-when">
          {whenLabel ?? 'Pick a time'}
        </span>
      </div>
      <div className="sum-total">
        <span className="k">Total</span>
        <span className="v" id="sm-total">
          {money(service?.price_lkr ?? 0)}
        </span>
      </div>
      <p className="summary__note">
        Pay at the salon, cash or card. Free cancellation up to 2 hours before your slot — just give us a call.
      </p>
    </aside>
  );
}
