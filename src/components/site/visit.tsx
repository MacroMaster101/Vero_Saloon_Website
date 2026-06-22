import { getBusinessHours } from '@/lib/queries';
import { minutesToLabel } from '@/lib/format';
import { ImgSlot } from '@/components/site/img-slot';
import type { BusinessHour } from '@/lib/supabase/types';
import { BLOCK_DEFAULTS, type ContactContent } from '@/lib/content/blocks';

// Monday-first order; values are day_of_week (0=Sun..6=Sat).
const DAYS: { dow: number; label: string }[] = [
  { dow: 1, label: 'Monday' },
  { dow: 2, label: 'Tuesday' },
  { dow: 3, label: 'Wednesday' },
  { dow: 4, label: 'Thursday' },
  { dow: 5, label: 'Friday' },
  { dow: 6, label: 'Saturday' },
  { dow: 0, label: 'Sunday' },
];

export async function Visit({ content = BLOCK_DEFAULTS.contact }: { content?: ContactContent }) {
  const hours = await getBusinessHours();
  const byDow = new Map<number, BusinessHour>(hours.map((h) => [h.day_of_week, h]));

  return (
    <section className="section" id="visit">
      <div className="wrap visit__grid">
        <div className="reveal">
          <span className="eyebrow">Find Us</span>
          <h2 className="h-section">On Attanagalla Road, Pasyala</h2>
          <ul className="hours" id="hours">
            {DAYS.map(({ dow, label }) => {
              const h = byDow.get(dow);
              const text = !h || h.is_closed
                ? 'Closed'
                : `${minutesToLabel(h.open_minute)} — ${minutesToLabel(h.close_minute)}`;
              return (
                <li key={dow}><span className="day">{label}</span><span>{text}</span></li>
              );
            })}
          </ul>
          <div className="contact-row">
            <div className="info-card"><div className="k">Address</div><div className="v">{content.address}</div></div>
            <div className="info-card"><div className="k">Plus code</div><div className="v">{content.plusCode}</div></div>
          </div>
          <div className="contact-row">
            <div className="info-card"><div className="k">Call / WhatsApp</div><div className="v">{content.phonePrimary}</div></div>
            <div className="info-card"><div className="k">Also</div><div className="v">{content.phoneOther}</div></div>
          </div>
          <div className="contact-row">
            <a href="#book" className="btn btn--primary">Book your visit</a>
            <a href={content.facebookUrl} target="_blank" rel="noopener" className="btn btn--ghost">Visit Facebook</a>
          </div>
        </div>
        <div className="map reveal">
          <ImgSlot src="/images/visit/map.png" alt="Find us on the map" />
          <svg className="map__pin" width="44" height="44" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C7.6 2 4 5.6 4 10c0 5.4 7 11.5 7.3 11.8.4.3.9.3 1.3 0C13 21.5 20 15.4 20 10c0-4.4-3.6-8-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z"/></svg>
        </div>
      </div>
    </section>
  );
}
