import { getServices } from '@/lib/queries';
import { ServicesMenu } from './services-menu';

export async function Services() {
  const services = await getServices();
  const hair = services.filter((s) => s.category === 'hair');
  const beauty = services.filter((s) => s.category === 'beauty');
  // Featured callout: an explicitly featured service, else the priciest (signature) one.
  const featured =
    services.find((s) => s.is_featured)
    ?? [...services].sort((a, b) => b.price_lkr - a.price_lkr)[0]
    ?? null;

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
        <ServicesMenu hair={hair} beauty={beauty} featured={featured} />
      </div>
    </section>
  );
}
