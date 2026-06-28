'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { Service, Stylist } from '@/lib/supabase/types';
import { BookingModal } from './booking-modal';

type BookingCtx = {
  open: boolean;
  enabled: boolean;
  openBooking: () => void;
  closeBooking: () => void;
};

const Ctx = createContext<BookingCtx | null>(null);

export function useBooking(): BookingCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useBooking must be used within BookingProvider');
  return ctx;
}

export function BookingProvider({
  services,
  stylists,
  enabled,
  children,
}: {
  services: Service[];
  stylists: Stylist[];
  enabled: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const openBooking = useCallback(() => {
    if (enabled) setOpen(true);
  }, [enabled]);
  const closeBooking = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ open, enabled, openBooking, closeBooking }),
    [open, enabled, openBooking, closeBooking],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      {enabled && (
        <BookingModal open={open} onClose={closeBooking} services={services} stylists={stylists} />
      )}
    </Ctx.Provider>
  );
}
