import type { Metadata } from 'next';
import { LegalPage, type LegalSection } from '@/components/site/legal-page';

export const metadata: Metadata = {
  title: 'Terms of Service — Vero Salon',
  description: 'The terms for booking and using Vero Salon’s website and services.',
};

const sections: LegalSection[] = [
  {
    id: 'booking',
    heading: 'Booking & cancellation',
    body: (
      <ul>
        <li>You can book online by choosing a service, a stylist (or &ldquo;no preference&rdquo;) and a time. <strong>Walk-ins are always welcome</strong> too.</li>
        <li>No deposit and no account are required to book.</li>
        <li>Please let us know in advance if you need to cancel or reschedule, so we can offer the slot to someone else.</li>
        <li>Repeated no-shows may affect your ability to book ahead; we may contact you to confirm future bookings.</li>
        <li>Times shown are guidelines — a service may run slightly over depending on your hair and the look you want.</li>
      </ul>
    ),
  },
  {
    id: 'payment',
    heading: 'Payment',
    body: (
      <ul>
        <li>Payment is made <strong>in person at the salon</strong> (cash or card). We do not take payment online.</li>
        <li>All prices are in <strong>Sri Lankan Rupees (LKR)</strong>.</li>
        <li>Prices shown are starting prices. The <strong>final quote is confirmed at your consultation</strong>, as the work needed varies by hair length, condition and the result you&rsquo;re after.</li>
      </ul>
    ),
  },
  {
    id: 'accounts',
    heading: 'Your account & conduct',
    body: (
      <ul>
        <li>You are responsible for the activity on your account and for keeping your login details secure.</li>
        <li>Please provide accurate booking details (name and a reachable mobile number) so we can confirm your appointment.</li>
        <li>Don&rsquo;t use the site to submit false bookings, abuse staff, or interfere with the service. We may refuse or cancel bookings that are abusive, fraudulent, or disruptive.</li>
      </ul>
    ),
  },
  {
    id: 'liability',
    heading: 'Service, liability & changes',
    body: (
      <ul>
        <li>We take care with every service, but results can vary between individuals and depend on your hair&rsquo;s condition and history. We&rsquo;ll always advise honestly at your consultation about what is achievable.</li>
        <li>Please tell your stylist about allergies, sensitivities, or previous treatments before any colour or chemical service.</li>
        <li>To the extent permitted by law, Vero Salon is not liable for indirect or incidental losses arising from use of the website.</li>
        <li>We may update these terms from time to time; the &ldquo;last updated&rdquo; date shown above is the current version.</li>
        <li>These terms are governed by the laws of <strong>Sri Lanka</strong>.</li>
      </ul>
    ),
  },
  {
    id: 'contact',
    heading: 'Contact',
    body: <p>Questions about these terms? Call the salon on <a href="tel:0773699620">077 369 9620</a>.</p>,
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      kicker="Legal"
      title="Terms of Service"
      lead="The simple terms for booking with Vero Salon and using this website."
      updated="30 June 2026"
      sections={sections}
    />
  );
}
