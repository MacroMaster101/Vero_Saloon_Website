// Typed access to environment variables. Lazy getters validate only on use, so
// an unconfigured optional service (e.g. email) doesn't crash unrelated code.
// The service-role key is read only by the server-only admin client.
function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export const env = {
  get supabaseUrl() { return required('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL); },
  get supabaseAnonKey() { return required('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY); },
  get serviceRoleKey() { return required('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY); },
  get resendApiKey() { return required('RESEND_API_KEY', process.env.RESEND_API_KEY); },
  get resendFrom() { return process.env.RESEND_FROM_EMAIL || 'Vero Salon <onboarding@resend.dev>'; },
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  // Optional: SL holiday sync. Empty string when unset (holiday features no-op).
  get googleCalendarKey() { return process.env.GOOGLE_CALENDAR_API_KEY || ''; },
};
