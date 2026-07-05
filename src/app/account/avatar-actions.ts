'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getUser } from '@/lib/supabase/auth';
import { slLankaPhone } from '@/lib/validators';
import { syncProfileToStylist } from '@/lib/identity/sync';
import { getAvatarInfo } from '@/lib/avatar';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const BUCKET = 'avatars';

type Result = { url: string } | { error: string };

// After an avatar/name change, mirror it onto the linked stylist card (if any).
// The stylist row stores the RESOLVED image URL so the public card always
// matches what the profile shows (uploaded photo, Google photo, or DiceBear).
async function syncAvatarForUser(userId: string): Promise<void> {
  try {
    const admin = createAdminClient();
    const { data: prof } = await admin.from('profiles').select('stylist_id, email, full_name').eq('id', userId).single();
    if (!prof?.stylist_id) return;
    const { data: authUser } = await admin.auth.admin.getUserById(userId);
    const meta = authUser?.user?.user_metadata ?? {};
    const seed = prof.email ?? prof.full_name ?? 'staff';
    const resolved = getAvatarInfo(meta, seed).src;
    await syncProfileToStylist(prof.stylist_id, { avatarUrl: resolved });
  } catch (err) {
    console.error('[identity] avatar sync skipped:', err);
  }
}

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

  await syncAvatarForUser(user.id);

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

  await syncAvatarForUser(user.id);

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

  await syncAvatarForUser(user.id);

  revalidatePath('/', 'layout');
  return { url: avatarUrl || '' };
}

/** Update the user's display name + contact number (one import for the modal).
 *  Phone is optional: blank clears it; otherwise it must be a valid SL mobile. */
export async function updateProfileDetails(fullName: string, phone: string): Promise<Result> {
  const user = await getUser();
  if (!user) return { error: 'Not signed in.' };
  const name = fullName.trim().slice(0, 120);

  let phoneValue: string | null = null;
  if (phone.trim() !== '') {
    const parsed = slLankaPhone.safeParse(phone);
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Enter a valid phone number' };
    phoneValue = parsed.data;
  }

  const sb = await createClient();
  const { error } = await sb.from('profiles').update({ full_name: name, phone: phoneValue }).eq('id', user.id);
  if (error) return { error: error.message };

  const admin = createAdminClient();
  const { data: prof } = await admin.from('profiles').select('stylist_id').eq('id', user.id).single();
  if (prof?.stylist_id) await syncProfileToStylist(prof.stylist_id, { name });

  revalidatePath('/', 'layout');
  return { url: '' };
}
