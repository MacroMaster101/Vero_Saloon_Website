import Link from 'next/link';
import { requireRole } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { ServicesList } from './services-list';

export default async function ServicesPage() {
  await requireRole(['admin'], '/admin/services');
  const sb = await createClient();
  const { data: services } = await sb.from('services').select('*').order('sort_order');
  return (
    <div className="apage">
      <div className="ahead">
        <div>
          <span className="eyebrow">Catalogue</span>
          <h1 className="ahead__title">Services</h1>
        </div>
        <Link href="/#services" target="_blank" className="btn btn--ghost">View on site ↗</Link>
      </div>
      <ServicesList services={services ?? []} />
    </div>
  );
}
