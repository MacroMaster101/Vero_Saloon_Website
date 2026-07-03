import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/supabase/auth';
import { GalleryList } from '@/app/admin/(protected)/gallery/gallery-list';
import { Icon } from '@/components/ui/icon';

export default async function OwnerPhotosPage() {
  await requireRole(['owner', 'admin'], '/owner/photos');
  const sb = await createClient();
  const { data: items } = await sb.from('gallery').select('*').order('sort_order');
  return (
    <div>
      <Link href="/owner" className="oback"><Icon name="arrowLeft" className="ic" /> Home</Link>
      <h1 className="opage__title">Photos</h1>
      <p className="opage__hint">The pictures shown in the website&apos;s lookbook.</p>
      <GalleryList items={items ?? []} />
    </div>
  );
}
