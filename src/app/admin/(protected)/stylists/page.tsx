import Link from 'next/link';
import { requireRole } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import { StylistsList } from './stylists-list';

export default async function StylistsPage() {
  await requireRole(['admin'], '/admin/stylists');
  const sb = await createClient();
  const { data: stylists } = await sb.from('stylists').select('*').order('sort_order');
  return (
    <div className="apage">
      <div className="ahead">
        <div>
          <span className="eyebrow">Team</span>
          <h1 className="ahead__title">Stylists</h1>
        </div>
        <Link href="/#stylists" target="_blank" className="btn btn--ghost">View on site ↗</Link>
      </div>
      <StylistsList stylists={stylists ?? []} />
    </div>
  );
}
