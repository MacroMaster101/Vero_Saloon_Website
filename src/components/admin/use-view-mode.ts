'use client';
import { useEffect, useState } from 'react';

export type ViewMode = 'cards' | 'rows';

/**
 * Per-list card/row preference, persisted to localStorage (`vero-view-<key>`).
 * SSR renders the 'cards' default; the stored choice is applied after mount
 * (a momentary default beats a hydration mismatch). Note this is the OPPOSITE
 * trade-off to the theme toggle, which avoids the flash entirely via the
 * beforeInteractive script in app/layout.tsx — worth copying if this flash
 * ever becomes annoying on the admin lists.
 */
export function useViewMode(key: string): [ViewMode, (m: ViewMode) => void] {
  const storageKey = `vero-view-${key}`;
  const [mode, setMode] = useState<ViewMode>('cards');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot read of persisted client state after mount
      if (stored === 'rows' || stored === 'cards') setMode(stored);
    } catch {}
  }, [storageKey]);

  function set(m: ViewMode) {
    setMode(m);
    try { localStorage.setItem(storageKey, m); } catch {}
  }

  return [mode, set];
}
