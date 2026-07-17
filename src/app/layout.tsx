import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { cookies } from 'next/headers';
import { poppins, fraunces } from '@/lib/fonts';
import { env } from '@/lib/env';
import './globals.css';

// Runs before paint to set data-theme and avoid a flash (vero-theme key).
const themeScript = `(function(){try{var t=localStorage.getItem('vero-theme');if(!t){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;

const TITLE = 'Vero Salon — Online Hair & Beauty Booking · Pasyala';
const DESCRIPTION =
  'Book hair, colour, beard, bridal and beauty appointments online at Vero Salon — a unisex salon in Pasyala, Sri Lanka. ' +
  'Sign in with Google to save your bookings and manage appointments. Open daily 10 AM – midnight.';

// Structured data helps Google understand the app is a salon booking service
const STRUCTURED_DATA = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': ['HairSalon', 'BeautySalon'],
  name: 'Vero Salon',
  description:
    'Vero Salon is an online appointment-booking application for a unisex hair and beauty salon in Pasyala, Sri Lanka. ' +
    'Users may sign in with Google to book services, manage upcoming appointments and view past bookings.',
  url: 'https://vero-salon.vercel.app',
  telephone: '+94773699620',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Pasyala',
    addressCountry: 'LK',
  },
  openingHours: 'Mo-Su 10:00-24:00',
  currenciesAccepted: 'LKR',
  priceRange: '$$',
  potentialAction: {
    '@type': 'ReserveAction',
    target: 'https://vero-salon.vercel.app/#services',
    'result': { '@type': 'Reservation', name: 'Hair & Beauty Appointment' },
  },
});

// metadataBase lets Next resolve the auto-detected opengraph-image to an
// absolute URL; openGraph/twitter give links a branded preview card.
export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'Vero Salon', 'hair salon Pasyala', 'beauty salon Sri Lanka',
    'online booking', 'hair appointment', 'colour balayage', 'beard grooming',
    'bridal makeup Sri Lanka', 'salon near me', 'book hair appointment',
  ],
  applicationName: 'Vero Salon Online Booking',
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: 'Vero Salon',
    locale: 'en_LK',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'en';

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <Script id="vero-theme" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* Schema.org structured data — tells Google this is a salon booking application */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: STRUCTURED_DATA }}
        />
      </head>
      <body className={`${poppins.variable} ${fraunces.variable}`}>{children}</body>
    </html>
  );
}
