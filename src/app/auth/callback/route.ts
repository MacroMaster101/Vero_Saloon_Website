import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { safeNext } from '@/lib/auth/redirect';
import { routeForSession } from '@/lib/auth/routing';
import { getProfile } from '@/lib/supabase/auth';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = safeNext(url.searchParams.get('next'));
  if (code) {
    const sb = await createClient();
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(new URL('/login?error=oauth', url.origin));
  }
  const profile = await getProfile();
  const target = routeForSession(profile?.role ?? null, profile?.stylistId ?? null, false, next);
  return NextResponse.redirect(new URL(target, url.origin));
}
