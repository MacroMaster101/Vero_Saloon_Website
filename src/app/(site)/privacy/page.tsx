import type { Metadata } from 'next';
import { LegalPage, type LegalSection } from '@/components/site/legal-page';

export const metadata: Metadata = {
  title: 'Privacy Policy — Vero Salon',
  description: 'How Vero Salon collects, uses, stores and deletes your data.',
};

const sections: LegalSection[] = [
  {
    id: 'collect',
    heading: 'What we collect',
    body: (
      <ul>
        <li><strong>When you book:</strong> your name, mobile number, email (optional), and any notes you add.</li>
        <li><strong>When you create an account:</strong> your name and email — either by signing in with Google, or by registering with an email address and password. Passwords are stored securely (hashed) by our authentication provider; we never see your plain password.</li>
      </ul>
    ),
  },
  {
    id: 'why',
    heading: 'Why we collect it',
    body: <p>To schedule and confirm your appointments, contact you about your booking, and keep an appointment history for your account.</p>,
  },
  {
    id: 'storage',
    heading: 'Where it’s stored',
    body: <p>In our Supabase database (hosted infrastructure). Access is restricted: you can see only your own bookings and profile; salon staff see only their assigned appointments; administrators manage the salon.</p>,
  },
  {
    id: 'sharing',
    heading: 'Who we share it with',
    body: (
      <>
        <ul>
          <li><strong>Google</strong> — only if you choose to sign in with Google (for authentication).</li>
          <li><strong>Resend</strong> — to send your booking confirmation email.</li>
        </ul>
        <p>We do not sell your data or use third-party advertising or analytics trackers.</p>
      </>
    ),
  },
  {
    id: 'retention',
    heading: 'How long we keep it',
    body: <p>Bookings older than 24 months are anonymized (personal details removed, the appointment record kept without identifying you).</p>,
  },
  {
    id: 'deletion',
    heading: 'Deleting your data',
    body: (
      <ul>
        <li><strong>Self-service:</strong> sign in, go to your account page, and use &ldquo;Delete my account &amp; data&rdquo;. Your account is removed and your bookings are anonymized immediately.</li>
        <li><strong>Or ask us:</strong> contact the salon and we&rsquo;ll delete your data for you.</li>
      </ul>
    ),
  },
  {
    id: 'contact',
    heading: 'Contact',
    body: <p>Call the salon on <a href="tel:0773699620">077 369 9620</a> for any privacy request.</p>,
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      kicker="Legal"
      title="Privacy Policy"
      lead="What we collect when you book or create an account, why we collect it, and how to have it removed."
      updated="5 June 2026"
      sections={sections}
    />
  );
}
