'use server';

import { cookies } from 'next/headers';

export async function setLocale(locale: string) {
  const cookieStore = await cookies();
  cookieStore.set('locale', locale, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}

export async function getLocale() {
  const cookieStore = await cookies();
  return cookieStore.get('locale')?.value || 'en';
}
