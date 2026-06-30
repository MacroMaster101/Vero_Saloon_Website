'use client';

import { useBooking } from '@/components/booking/booking-provider';

const VARIANT_CLASS: Record<string, string> = {
  primary: 'home-btn home-btn--primary',
  ghost: 'home-btn home-btn--ghost',
  light: 'home-btn home-btn--light',
  bar: 'home-btn home-btn--primary home-mobile-book',
};

export function BookButton({
  variant = 'primary',
  className = '',
  children,
}: {
  variant?: 'primary' | 'ghost' | 'light' | 'bar';
  className?: string;
  children: React.ReactNode;
}) {
  const { openBooking, enabled } = useBooking();
  if (!enabled) return null;
  return (
    <button type="button" className={`${VARIANT_CLASS[variant]} ${className}`.trim()} onClick={openBooking}>
      {children}
    </button>
  );
}
