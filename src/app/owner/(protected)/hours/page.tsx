import Link from 'next/link';
import { requireRole } from '@/lib/supabase/auth';
import { getBusinessHours } from '@/lib/queries';
import { HoursForm } from '@/app/admin/(protected)/content/content-forms';
import { Icon } from '@/components/ui/icon';

export default async function OwnerHoursPage() {
  await requireRole(['owner', 'admin'], '/owner/hours');
  const hours = await getBusinessHours();
  return (
    <div>
      <Link href="/owner" className="oback"><Icon name="arrowLeft" className="ic" /> Home</Link>
      <h1 className="opage__title">Opening hours</h1>
      <p className="opage__hint">When the shop is open. Customers can only book inside these times.</p>
      <HoursForm hours={hours} />
    </div>
  );
}
