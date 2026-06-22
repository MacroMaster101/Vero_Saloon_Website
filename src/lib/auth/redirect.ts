// Returns the path only if it is a safe same-origin relative path, else null.
export function safeNext(next: string | undefined | null): string | null {
  if (!next) return null;
  if (!next.startsWith('/') || next.startsWith('//')) return null;
  if (/[\x00-\x1f]/.test(next) || next.includes(':')) return null;
  return next;
}
