'use client';

import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
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
          <h2 id="booking-modal-title" className="home-modal__title">Book your visit</h2>
          <button type="button" className="home-modal__close" aria-label="Close booking" onClick={onClose}>×</button>
        </div>
        <div className="home-modal__body">
          <BookingWizard services={services} stylists={stylists} />
        </div>
      </div>
    </div>
  );
}
