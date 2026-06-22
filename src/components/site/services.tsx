import { getServices } from '@/lib/queries';
import { money } from '@/lib/format';
import type { Service } from '@/lib/supabase/types';

function PriceRow({ s }: { s: Service }) {
  return (
    <div className="price-row">
      <span className="name">{s.name}</span>
      <span className="price">{money(s.price_lkr)}</span>
      <span className="desc">{s.description}</span>
      <span className="dur">{s.duration_min} min</span>
    </div>
  );
}

export async function Services() {
  const services = await getServices();
  const hair = services.filter((s) => s.category === 'hair');
  const beauty = services.filter((s) => s.category === 'beauty');

  return (
    <section className="section" id="services">
      <div className="wrap">
        <div className="sec-head reveal">
          <div>
            <span className="eyebrow">The Menu</span>
            <h2 className="h-section">Services &amp; pricing</h2>
          </div>
          <p className="lead">Hair, colour and beauty for everyone. Prices in LKR — final quote confirmed at your consultation.</p>
        </div>
        <div className="menu reveal">
          <div className="menu__col">
            <h3>Hair</h3>
            {hair.map((s) => <PriceRow key={s.id} s={s} />)}
          </div>
          <div className="menu__col">
            <h3>Beauty &amp; Bridal</h3>
            {beauty.map((s) => <PriceRow key={s.id} s={s} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
