// Browser (client-component) Supabase client. Uses the public anon key and runs
// under RLS. For server code use ./server; for RLS-bypass use ./admin.
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';
import { env } from '@/lib/env';

export function createClient() {
  return createBrowserClient<Database>(env.supabaseUrl, env.supabaseAnonKey);
}
