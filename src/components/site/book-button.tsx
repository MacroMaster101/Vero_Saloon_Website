'use client';

import { useBooking } from '@/components/booking/booking-provider';

const VARIANT_CLASS: Record<string, string> = {
  primary: 'v2-btn v2-btn--primary',
  ghost: 'v2-btn v2-btn--ghost',
  light: 'v2-btn v2-btn--light',
  bar: 'v2-btn v2-btn--primary v2-mobile-book',
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
