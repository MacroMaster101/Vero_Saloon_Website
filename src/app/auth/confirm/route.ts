import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { safeNext } from '@/lib/auth/redirect';

// Email-link landing that works across browsers/devices: the Supabase email
// templates link here with a token_hash, and we verify it server-side (no
// PKCE verifier cookie needed, unlike /auth/callback's code exchange). Used
// by the staff invite and password recovery templates.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') as EmailOtpType | null;
  const next = safeNext(url.searchParams.get('next')) ?? '/reset-password';

  if (tokenHash && type) {
    const sb = await createClient();
    const { error } = await sb.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  return NextResponse.redirect(new URL('/forgot-password?error=expired', url.origin));
}
