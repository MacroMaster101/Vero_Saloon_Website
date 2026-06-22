'use client';
import { forwardRef, useImperativeHandle, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { bookingDetailsSchema, type BookingDetails } from '@/lib/validators';

// Form-input shape: `notes` is optional at input (zod `.default('')`).
type DetailsInput = z.input<typeof bookingDetailsSchema>;

export interface StepDetailsHandle {
  /** Validate the form; resolves to typed values, or null if invalid. */
  validate: () => Promise<BookingDetails | null>;
}

export const StepDetails = forwardRef<
  StepDetailsHandle,
  { onValidityChange?: (valid: boolean) => void; active?: boolean }
>(function StepDetails({ onValidityChange, active = true }, ref) {
  const {
    register,
    trigger,
    getValues,
    formState: { errors, isValid },
  } = useForm<DetailsInput>({
    resolver: zodResolver(bookingDetailsSchema),
    mode: 'onChange',
    defaultValues: { name: '', phone: '', email: '', notes: '' },
  });

  useEffect(() => {
    onValidityChange?.(isValid);
  }, [isValid, onValidityChange]);

  useImperativeHandle(ref, () => ({
    async validate() {
      const ok = await trigger();
      if (!ok) return null;
      const parsed = bookingDetailsSchema.safeParse(getValues());
      return parsed.success ? parsed.data : null;
    },
  }));

  return (
    <div className="step active" data-step="3">
      <h3 className="step__title">Almost done — your details</h3>
      <p className="step__hint">We&apos;ll text you a confirmation and a reminder the morning of.</p>
      <div className="fields-2">
        <div className={`field${errors.name ? ' invalid' : ''}`} id="f-name">
          <label htmlFor="i-name">Full name</label>
          <input
            id="i-name"
            type="text"
            placeholder="e.g. Nimal Perera"
            autoComplete="name"
            className={errors.name ? 'err' : ''}
            disabled={!active}
            {...register('name')}
          />
          <div className="msg">{errors.name?.message ?? 'Please enter your name.'}</div>
        </div>
        <div className={`field${errors.phone ? ' invalid' : ''}`} id="f-phone">
          <label htmlFor="i-phone">Mobile number</label>
          <input
            id="i-phone"
            type="tel"
            placeholder="077 369 9620"
            autoComplete="tel"
            className={errors.phone ? 'err' : ''}
            disabled={!active}
            {...register('phone')}
          />
          <div className="msg">{errors.phone?.message ?? 'Enter a valid phone number.'}</div>
        </div>
      </div>
      <div className={`field${errors.email ? ' invalid' : ''}`} id="f-email">
        <label htmlFor="i-email">
          Email{' '}
          <span style={{ textTransform: 'none', letterSpacing: 0, color: 'var(--fg-muted)', fontWeight: 500 }}>
            (optional)
          </span>
        </label>
        <input
          id="i-email"
          type="email"
          placeholder="you@email.com"
          autoComplete="email"
          className={errors.email ? 'err' : ''}
          disabled={!active}
          {...register('email')}
        />
        <div className="msg">{errors.email?.message ?? "That email doesn't look right."}</div>
      </div>
      <div className="field">
        <label htmlFor="i-notes">
          Notes for your stylist{' '}
          <span style={{ textTransform: 'none', letterSpacing: 0, color: 'var(--fg-muted)', fontWeight: 500 }}>
            (optional)
          </span>
        </label>
        <textarea
          id="i-notes"
          rows={2}
          placeholder="Shoulder length, keep the layers, a warm brown…"
          disabled={!active}
          {...register('notes')}
        />
      </div>
    </div>
  );
});
