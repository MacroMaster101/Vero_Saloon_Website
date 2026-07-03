// Who may change whose role. Mirrors the DB protect_profile_privileges()
// trigger (migration 0011): admin is unrestricted; owner may only move
// people between user/staff (so can neither edit privileged accounts nor
// grant privileged roles); nobody else changes roles.
import type { Role } from '@/lib/auth/roles';

const TEAM: readonly Role[] = ['user', 'staff'];

export function canSetRole(actor: Role, targetCurrent: Role, next: Role): boolean {
  if (actor === 'admin') return true;
  if (actor === 'owner') return TEAM.includes(targetCurrent) && TEAM.includes(next);
  return false;
}

export function assignableRoles(actor: Role): Role[] {
  if (actor === 'admin') return ['user', 'staff', 'admin', 'owner'];
  if (actor === 'owner') return ['user', 'staff'];
  return [];
}
