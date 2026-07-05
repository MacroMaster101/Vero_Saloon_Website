// Pure decision + derivation logic for the "invite staff by email" flow.
// The server action (people/actions.ts) does the IO; this decides what to do
// and shapes the hidden shell stylist card. Unit-tested in staff-invite-rules.test.ts.
import type { Role } from '@/lib/auth/roles';
import { canSetRole } from '@/lib/auth/role-rules';
import { slugify } from '@/lib/admin/service-schema';

export type InviteTarget = { id: string; role: Role; stylist_id: string | null } | null;

export type InviteDecision =
  | { kind: 'invite_new' }
  | { kind: 'promote'; profileId: string; stylistId: string | null }
  | { kind: 'already_staff' }
  | { kind: 'refuse'; reason: string };

export function inviteDecision(actor: Role, target: InviteTarget): InviteDecision {
  if (target === null) return { kind: 'invite_new' };
  if (target.role === 'staff' && target.stylist_id) return { kind: 'already_staff' };
  if (target.role === 'admin' || target.role === 'owner') {
    return { kind: 'refuse', reason: 'That email belongs to an admin or owner account.' };
  }
  if (!canSetRole(actor, target.role, 'staff')) {
    return { kind: 'refuse', reason: "You can't change that account's role." };
  }
  return { kind: 'promote', profileId: target.id, stylistId: target.stylist_id };
}

export function nameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? '';
  const words = local.split(/[._\-+]+/).filter(Boolean);
  const cased = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1));
  return cased.join(' ') || 'New Stylist';
}

export function uniqueSlug(base: string, taken: string[]): string {
  const set = new Set(taken);
  if (!set.has(base)) return base;
  for (let i = 2; ; i++) {
    const candidate = `${base}-${i}`;
    if (!set.has(candidate)) return candidate;
  }
}

/** Hidden, empty card created at invite time so staff land linked on day one. */
export function shellCardFromEmail(email: string, takenSlugs: string[], maxSort: number) {
  const name = nameFromEmail(email);
  return {
    name,
    slug: uniqueSlug(slugify(name), takenSlugs),
    role: '',
    tags: [] as string[],
    avatar_url: null,
    sort_order: maxSort + 1,
    is_active: false,
  };
}
