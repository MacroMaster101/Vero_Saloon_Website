// App fonts (Poppins sans + Fraunces display), exposed as CSS variables that
// globals.css consumes. Loaded via next/font for self-hosting + zero layout shift.
import { Poppins, Fraunces } from 'next/font/google';

export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

export const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});
