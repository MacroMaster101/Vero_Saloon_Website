// Pure shaping for the profile ↔ stylist identity sync: given "what changed"
// (display name and/or avatar URL), produce the per-table update payloads.
// undefined = field untouched; avatarUrl null = photo explicitly cleared.
export type IdentityChange = { name?: string; avatarUrl?: string | null };

export function stylistPatch(change: IdentityChange): { name?: string; avatar_url?: string | null } {
  const patch: { name?: string; avatar_url?: string | null } = {};
  if (change.name !== undefined && change.name.trim() !== '') patch.name = change.name.trim();
  if (change.avatarUrl !== undefined) patch.avatar_url = change.avatarUrl;
  return patch;
}

export function profilePatch(change: IdentityChange): { full_name?: string } {
  if (change.name !== undefined && change.name.trim() !== '') return { full_name: change.name.trim() };
  return {};
}

export function metadataPatch(change: IdentityChange): Record<string, unknown> {
  if (change.avatarUrl === undefined) return {};
  if (change.avatarUrl === null) {
    return { avatar_url: null, custom_avatar_url: null, avatar_choice: 'dicebear' };
  }
  return { avatar_url: change.avatarUrl, custom_avatar_url: change.avatarUrl, avatar_choice: 'custom' };
}
