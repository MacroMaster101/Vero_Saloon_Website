import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase/auth';
import { ResetForm } from './reset-form';

// The recovery email lands on /auth/callback, which exchanges the code for a
// session and forwards here. No session means the link expired or was reused.
export default async function ResetPasswordPage() {
  const user = await getUser();
  if (!user) redirect('/forgot-password?error=expired');
  return <main><ResetForm email={user.email ?? ''} /></main>;
}
