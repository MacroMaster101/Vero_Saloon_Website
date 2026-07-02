import { ForgotForm } from './forgot-form';

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  const expired = sp.error === 'expired'
    ? 'That reset link has expired or was already used — request a new one below.'
    : null;
  return <main><ForgotForm expiredNotice={expired} /></main>;
}
