import type { Metadata, Viewport } from 'next';
import { poppins, fraunces } from '@/lib/fonts';
import { ThemeScript } from '@/components/theme/theme-script';
import './globals.css';

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
      <head><ThemeScript /></head>
      <body className={`${poppins.variable} ${fraunces.variable}`}>{children}</body>
    </html>
  );
}
