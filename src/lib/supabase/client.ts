import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';
import { env } from '@/lib/env';

export function createClient() {
  return createBrowserClient<Database>(env.supabaseUrl, env.supabaseAnonKey);
}
