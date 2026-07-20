// Admin image upload to Supabase Storage (gallery/service/stylist photos). Uses
// the service-role client and self-guards with requireRole('admin').
'use server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/supabase/auth';

// MIME → extension. The storage key is built from the validated file.type, never
// from file.name: a client-supplied filename can smuggle path segments into the
// key and, since this uploads as service role, place the object outside the
// intended prefix. Mirrors account/avatar-actions.ts.
const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
};
const ALLOWED = Object.keys(EXT_BY_TYPE);
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

type UploadResult = { url: string } | { error: string };

export async function uploadImage(formData: FormData): Promise<UploadResult> {
  await requireRole(['admin', 'owner'], '/admin');
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) return { error: 'No file selected' };
  if (!ALLOWED.includes(file.type)) return { error: 'Use a JPG, PNG, WEBP, AVIF or GIF image' };
  if (file.size > MAX_BYTES) return { error: 'Image must be under 5 MB' };

  const ext = EXT_BY_TYPE[file.type];
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
