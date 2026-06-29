// Auth helpers: current user/profile lookups and the role guard (requireRole)
// used by protected layouts and server actions. authDecision is the pure,
// unit-tested core; requireRole enforces it with redirects.
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Role } from '@/lib/auth/roles';

export async function getUser() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  return user;
}

export type Profile = { userId: string; email: string | null; fullName: string | null; role: Role; stylistId: string | null };

export async function getProfile(): Promise<Profile | null> {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb.from('profiles').select('role, stylist_id, full_name, email').eq('id', user.id).single();
  return {
    userId: user.id,
    email: data?.email ?? user.email ?? null,
    fullName: data?.full_name ?? null,
    role: (data?.role ?? 'user') as Role,
    stylistId: data?.stylist_id ?? null,
  };
}

// Pure decision (unit-tested). next is the path to return to after login.
export type AuthDecision = { kind: 'allow' } | { kind: 'login'; next: string } | { kind: 'deny' };
export function authDecision(role: Role | null, allowed: Role[], next: string): AuthDecision {
  if (role === null) return { kind: 'login', next };
  if (allowed.includes(role)) return { kind: 'allow' };
  return { kind: 'deny' };
}

// Server guard: enforces the decision with redirects. Returns the profile when allowed.
export async function requireRole(allowed: Role[], currentPath: string): Promise<Profile> {
  const profile = await getProfile();
  const decision = authDecision(profile?.role ?? null, allowed, currentPath);
  if (decision.kind === 'login') redirect(`/login?next=${encodeURIComponent(decision.next)}`);
  if (decision.kind === 'deny') redirect('/account');
  return profile!;
}
