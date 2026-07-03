import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/supabase/auth';
import { ServicesList } from '@/app/admin/(protected)/services/services-list';
import { Icon } from '@/components/ui/icon';

export default async function OwnerServicesPage() {
  await requireRole(['owner', 'admin'], '/owner/services');
  const sb = await createClient();
  const { data: services } = await sb.from('services').select('*').order('sort_order');
  return (
    <div>
      <Link href="/owner" className="oback"><Icon name="arrowLeft" className="ic" /> Home</Link>
      <h1 className="opage__title">Prices &amp; services</h1>
      <p className="opage__hint">These are the services customers can book, with prices and how long they take.</p>
      <ServicesList services={services ?? []} />
    </div>
  );
}
