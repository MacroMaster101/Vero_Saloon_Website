import type { Service, Stylist } from '@/lib/supabase/types';
import { VipTicket } from './vip-ticket';
import { QuickActions } from './quick-actions';
import { ServiceRail } from './service-rail';
import { StylistCarousel } from './stylist-carousel';

export function MobileHome({ services, stylists }: { services: Service[]; stylists: Stylist[] }) {
  return (
    <section className="mhome" aria-label="Vero salon">
      <VipTicket ctaHref="#book" />
      <QuickActions />
      <ServiceRail services={services} />
      <StylistCarousel stylists={stylists} />
    </section>
  );
}
