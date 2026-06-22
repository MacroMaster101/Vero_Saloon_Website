export type Role = 'user' | 'staff' | 'admin';

// After login, admins and users land on the home page; staff land on their
// dedicated /staff surface. (An explicit `next` destination still takes
// precedence — see the login action/callback.)
export function defaultLandingPath(): string {
  return '/';
}

// Role-aware post-login landing. Only staff get a non-home destination; admins
// reach their dashboard from the profile avatar dropdown, like before.
export function landingPathForRole(role: Role | null): string {
  return role === 'staff' ? '/staff' : '/';
}
