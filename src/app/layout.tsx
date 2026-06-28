import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { poppins, fraunces } from '@/lib/fonts';
import './globals.css';

// Runs before paint to set data-theme and avoid a flash (vero-theme key).
const themeScript = `(function(){try{var t=localStorage.getItem('vero-theme');if(!t){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;

export const metadata: Metadata = {
  title: 'Vero Salon — Hair & Beauty Unisex · Pasyala',
  description: "Pasyala's home for hair, colour and beauty — for him and her.",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="vero-theme" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${poppins.variable} ${fraunces.variable}`}>{children}</body>
    </html>
  );
}
