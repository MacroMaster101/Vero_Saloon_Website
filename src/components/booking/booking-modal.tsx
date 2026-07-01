'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Service, Stylist } from '@/lib/supabase/types';
import { BookingWizard } from './booking-wizard';

export function BookingModal({
  open,
  onClose,
  services,
  stylists,
}: {
  open: boolean;
  onClose: () => void;
  services: Service[];
  stylists: Stylist[];
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  // The wizard reports whether "Back" is available + how to trigger it, so the
  // modal can render Back in the header next to the title on every device.
  const [back, setBack] = useState<(() => void) | null>(null);
  // Stable callback so the wizard's reporting effect doesn't loop (a new inline
  // function each render would re-trigger the effect → infinite updates).
  const handleBackChange = useCallback((fn: (() => void) | null) => {
    setBack(() => fn);
  }, []);

  useEffect(() => {
    if (!open) return;
    // Lock vertical scroll while the modal is open. We deliberately DON'T set
    // overflow-x:hidden on body/root — the stylesheet keeps `overflow-x:clip`
    // there, and switching to `hidden` turns them into scroll containers (which
    // is what caused the stray sideways scroll). `overflow-y:hidden` on body
    // preserves the horizontal clip while stopping the page scrolling behind us.
    const { body } = document;
    body.style.overflowY = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      body.style.overflowY = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="home-modal" role="presentation">
      <div className="home-modal__backdrop" data-testid="booking-backdrop" onClick={onClose} />
      <div
        className="home-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
        tabIndex={-1}
        ref={panelRef}
      >
        <div className="home-modal__head">
          <div className="home-modal__head-left">
            {back && (
              <button type="button" className="home-modal__back" onClick={back} aria-label="Go back a step">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}
            <h2 id="booking-modal-title" className="home-modal__title">Book your visit</h2>
          </div>
          <button type="button" className="home-modal__close" aria-label="Close booking" onClick={onClose}>×</button>
        </div>
        <BookingWizard
          services={services}
          stylists={stylists}
          onBackChange={handleBackChange}
        />
      </div>
    </div>
  );
}
