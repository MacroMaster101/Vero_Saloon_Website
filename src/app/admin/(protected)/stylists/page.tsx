import Link from 'next/link';
import { requireRole } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { LoadError } from '@/components/admin/load-error';
import { StylistsList } from './stylists-list';

export default async function StylistsPage() {
  await requireRole(['admin'], '/admin/stylists');
  const sb = await createClient();
  const { data: stylists, error } = await sb.from('stylists').select('*').order('sort_order');
  return (
    <div className="apage">
      <div className="ahead">
        <div>
          <span className="eyebrow">Team</span>
          <h1 className="ahead__title">Stylists</h1>
        </div>
        <Link href="/#team" target="_blank" className="btn btn--ghost">View on site ↗</Link>
      </div>
      <LoadError what="stylists" error={error} />
      <StylistsList stylists={stylists ?? []} />
    </div>
  );
}
