import 'server-only';
import { createClient as createSb } from '@supabase/supabase-js';
import type { Database } from './types';
import { env } from '@/lib/env';

// Bypasses RLS — use ONLY in Server Actions after server-side validation.
export function createAdminClient() {
  return createSb<Database>(env.supabaseUrl, env.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
