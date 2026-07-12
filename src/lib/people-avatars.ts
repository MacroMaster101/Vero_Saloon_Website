import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAvatarInfo, type UserMetadata } from '@/lib/avatar';

/**
 * Avatar URL per auth user id, for the People/Team admin lists. Avatars live in
 * each user's auth metadata (not the profiles table), so listing them for OTHER
 * users needs the service-role client. Both callers sit behind requireRole.
 * Best-effort: any failure returns {} and the list falls back to DiceBear.
 */
export async function getPeopleAvatarMap(): Promise<Record<string, string>> {
  try {
    const admin = createAdminClient();
    const map: Record<string, string> = {};
    // Paginated; cap at 10 pages (2000 users) — far beyond a salon's roster.
    for (let page = 1; page <= 10; page++) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) break;
      for (const user of data.users) {
        map[user.id] = getAvatarInfo((user.user_metadata ?? null) as UserMetadata | null, user.email).src;
      }
      if (data.users.length < 200) break;
    }
    return map;
  } catch {
    return {};
  }
}
