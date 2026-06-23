// Avatar resolution: an uploaded photo always wins; otherwise we fall back to
// a deterministic DiceBear avatar seeded by the user's email or name, so every
// account gets a stable, friendly default with no upload required.
//
// DiceBear's HTTP API is public and key-less: https://www.dicebear.com/

const DICEBEAR_STYLE = 'lorelei'; // stylish pictorial avatars that match the brand
const DICEBEAR_BASE = `https://api.dicebear.com/9.x/${DICEBEAR_STYLE}/svg`;

/** A stable DiceBear URL for the given seed (email > name > 'guest'). */
export function dicebearUrl(seed: string | null | undefined): string {
  const s = (seed ?? '').trim() || 'guest';
  const params = new URLSearchParams({
    seed: s,
    backgroundType: 'gradientLinear',
    backgroundColor: 'd99a3d,b8742a', // brand gold gradient
  });
  return `${DICEBEAR_BASE}?${params.toString()}`;
}

export interface UserMetadata {
  avatar_url?: string | null;
  custom_avatar_url?: string | null;
  email_avatar_url?: string | null;
  avatar_choice?: 'custom' | 'dicebear' | 'email' | null;
  dicebear_seed?: string | null;
  picture?: string | null;
  [key: string]: unknown;
}

export function getAvatarInfo(userMetadata: UserMetadata | null | undefined, seed: string | null | undefined) {
  const meta = userMetadata || {};

  // A re-rolled cartoon seed (set when the user shuffles in the mobile app)
  // overrides the default email/name seed, so both apps render the same avatar.
  const dicebearSeed = meta.dicebear_seed || seed;

  // Extract custom uploaded avatar URL (if it is from our Supabase storage)
  let customAvatar = meta.custom_avatar_url || null;
  const currentAvatarUrl = meta.avatar_url;
  if (currentAvatarUrl && currentAvatarUrl.includes('/storage/v1/object/public/avatars/')) {
    customAvatar = currentAvatarUrl;
  }

  // Extract email provider avatar URL (Google profile photo)
  let emailAvatar = meta.picture || meta.email_avatar_url || null;
  if (currentAvatarUrl && currentAvatarUrl.startsWith('http') && !currentAvatarUrl.includes('/storage/v1/object/public/avatars/') && !currentAvatarUrl.includes('api.dicebear.com')) {
    emailAvatar = currentAvatarUrl;
  }

  // Determine user's active choice with safety fallbacks
  let choice = meta.avatar_choice;
  if (choice === 'email' && !emailAvatar) {
    choice = 'dicebear';
  }
  if (choice === 'custom' && !customAvatar) {
    choice = 'dicebear';
  }
  if (!choice) {
    if (customAvatar) {
      choice = 'custom';
    } else if (emailAvatar) {
      choice = 'email';
    } else {
      choice = 'dicebear';
    }
  }

  // Determine the correct rendering URL
  let src = dicebearUrl(dicebearSeed);
  if (choice === 'custom' && customAvatar) {
    src = customAvatar;
  } else if (choice === 'email' && emailAvatar) {
    src = emailAvatar;
  }

  return {
    choice: choice as 'custom' | 'email' | 'dicebear',
    customAvatar: customAvatar as string | null,
    emailAvatar: emailAvatar as string | null,
    src,
  };
}

/** Resolve the avatar to render: uploaded photo, Google photo, or DiceBear fallback. */
export function avatarSrc(uploadedOrMetadata: UserMetadata | string | null | undefined, seed: string | null | undefined): string {
  if (uploadedOrMetadata && typeof uploadedOrMetadata === 'object') {
    return getAvatarInfo(uploadedOrMetadata, seed).src;
  }
  const u = (uploadedOrMetadata ?? '').trim();
  if (!u || u === 'null' || u === 'undefined') {
    return dicebearUrl(seed);
  }
  return u;
}
