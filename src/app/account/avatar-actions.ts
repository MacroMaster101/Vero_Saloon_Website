'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getUser } from '@/lib/supabase/auth';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const BUCKET = 'avatars';

type Result = { url: string } | { error: string };

/**
 * Upload a profile photo for the CURRENT user and persist it to their auth
 * metadata. Self-service (any signed-in role) — the path is keyed by the
 * session user id, never by client input.
 */
export async function uploadAvatar(formData: FormData): Promise<Result> {
  const user = await getUser();
  if (!user) return { error: 'Not signed in.' };

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) return { error: 'No file selected' };
  if (!ALLOWED.includes(file.type)) return { error: 'Use a JPG, PNG, WEBP, AVIF or GIF image' };
  if (file.size > MAX_BYTES) return { error: 'Image must be under 5 MB' };

  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'png';
  // one file per user; upsert replaces the previous photo
  const path = `${user.id}/avatar.${ext}`;

  const admin = createAdminClient();
  const { error: upErr } = await admin.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: true,
  });
  if (upErr) return { error: upErr.message };

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  // cache-bust so the new image shows immediately after replacing an old one
  const url = `${data.publicUrl}?v=${Date.now()}`;

  const sb = await createClient();
  const { error: metaErr } = await sb.auth.updateUser({
    data: {
      avatar_url: url,
      custom_avatar_url: url,
      avatar_choice: 'custom'
    },
  });
  if (metaErr) return { error: metaErr.message };

  revalidatePath('/account');
  revalidatePath('/', 'layout');
  return { url };
}

/** Clear the uploaded photo so the DiceBear fallback shows again. */
export async function removeAvatar(): Promise<Result> {
  const user = await getUser();
  if (!user) return { error: 'Not signed in.' };
  const sb = await createClient();
  const { error } = await sb.auth.updateUser({
    data: {
      custom_avatar_url: null,
      avatar_choice: 'dicebear',
      avatar_url: null
    },
  });
  if (error) return { error: error.message };
  revalidatePath('/account');
  revalidatePath('/', 'layout');
  return { url: '' };
}

/** Switch the user's active avatar choice. */
export async function updateAvatarChoice(choice: 'custom' | 'dicebear' | 'email'): Promise<Result> {
  const user = await getUser();
  if (!user) return { error: 'Not signed in.' };
  const sb = await createClient();
  
  const meta = user.user_metadata || {};
  let avatarUrl: string | null = null;
  if (choice === 'custom') {
    avatarUrl = meta.custom_avatar_url || meta.avatar_url;
  } else if (choice === 'email') {
    avatarUrl = meta.picture || meta.email_avatar_url;
  }

  const { error } = await sb.auth.updateUser({
    data: {
      avatar_choice: choice,
      avatar_url: avatarUrl
    },
  });
  if (error) return { error: error.message };

  revalidatePath('/account');
  revalidatePath('/', 'layout');
  return { url: avatarUrl || '' };
}

/** Update the user's display name (kept here so the modal needs one import). */
export async function updateName(fullName: string): Promise<Result> {
  const user = await getUser();
  if (!user) return { error: 'Not signed in.' };
  const name = fullName.trim().slice(0, 120);
  const sb = await createClient();
  const { error } = await sb.from('profiles').update({ full_name: name }).eq('id', user.id);
  if (error) return { error: error.message };
  revalidatePath('/account');
  revalidatePath('/', 'layout');
  return { url: '' };
}
