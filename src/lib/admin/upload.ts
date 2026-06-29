// Admin image upload to Supabase Storage (gallery/service/stylist photos). Uses
// the service-role client and self-guards with requireRole('admin').
'use server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/supabase/auth';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

type UploadResult = { url: string } | { error: string };

export async function uploadImage(formData: FormData): Promise<UploadResult> {
  await requireRole(['admin'], '/admin');
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) return { error: 'No file selected' };
  if (!ALLOWED.includes(file.type)) return { error: 'Use a JPG, PNG, WEBP, AVIF or GIF image' };
  if (file.size > MAX_BYTES) return { error: 'Image must be under 5 MB' };

  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'png';
  const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const sb = createAdminClient();
  const { error } = await sb.storage.from('media').upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) return { error: error.message };

  const { data } = sb.storage.from('media').getPublicUrl(path);
  return { url: data.publicUrl };
}
