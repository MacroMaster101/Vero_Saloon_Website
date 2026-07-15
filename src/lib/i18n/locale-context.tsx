'use client';
import { createContext, useContext, type ReactNode } from 'react';

const LocaleCtx = createContext<string>('en');

export function LocaleProvider({ locale, children }: { locale: string; children: ReactNode }) {
  return <LocaleCtx.Provider value={locale}>{children}</LocaleCtx.Provider>;
}

/** Read the current locale from context. Falls back to 'en'. */
export function useLocale(): string {
  return useContext(LocaleCtx);
}
