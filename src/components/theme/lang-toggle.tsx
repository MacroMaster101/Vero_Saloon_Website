'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setLocale } from '@/app/locale-action';

export function LangToggle({ currentLocale, className }: { currentLocale: string; className?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (newLocale: string) => {
    if (newLocale === currentLocale || isPending) return;
    startTransition(async () => {
      await setLocale(newLocale);
      router.refresh();
    });
  };

  return (
    <div 
      className={`lang-toggle ${className || ''}`}
      style={{ 
        alignItems: 'center', 
        gap: '6px', 
        fontSize: '12px', 
        fontWeight: 700, 
        letterSpacing: '0.05em',
        opacity: isPending ? 0.6 : 1,
        transition: 'opacity 0.2s ease',
      }}
    >
      <button
        type="button"
        onClick={() => switchLocale('en')}
        style={{
          background: 'none',
          border: 'none',
          padding: '4px 6px',
          cursor: isPending ? 'not-allowed' : 'pointer',
          color: currentLocale === 'en' ? 'var(--accent)' : 'var(--fg-muted)',
          borderBottom: currentLocale === 'en' ? '2px solid var(--accent)' : '2px solid transparent',
          fontWeight: currentLocale === 'en' ? 700 : 500,
          fontFamily: 'var(--font-sans)',
        }}
        disabled={isPending}
      >
        EN
      </button>
      <span style={{ color: 'var(--line)', userSelect: 'none' }}>|</span>
      <button
        type="button"
        onClick={() => switchLocale('si')}
        style={{
          background: 'none',
          border: 'none',
          padding: '4px 6px',
          cursor: isPending ? 'not-allowed' : 'pointer',
          color: currentLocale === 'si' ? 'var(--accent)' : 'var(--fg-muted)',
          borderBottom: currentLocale === 'si' ? '2px solid var(--accent)' : '2px solid transparent',
          fontWeight: currentLocale === 'si' ? 700 : 500,
          fontFamily: 'var(--font-sans)',
        }}
        disabled={isPending}
      >
        සිංහල
      </button>
    </div>
  );
}
