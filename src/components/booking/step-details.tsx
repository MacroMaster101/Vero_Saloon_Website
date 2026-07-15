'use client';
import { forwardRef, useImperativeHandle, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { bookingDetailsSchema, type BookingDetails } from '@/lib/validators';
import type { BookingPrefill } from './booking-provider';
import { t } from '@/lib/i18n/translations';

// Form-input shape: `notes` is optional at input (zod `.default('')`).
type DetailsInput = z.input<typeof bookingDetailsSchema>;

export interface StepDetailsHandle {
  /** Validate the form; resolves to typed values, or null if invalid. */
  validate: () => Promise<BookingDetails | null>;
}

export const StepDetails = forwardRef<
  StepDetailsHandle,
  { prefill?: BookingPrefill | null; onValidityChange?: (valid: boolean) => void; active?: boolean; locale?: string }
>(function StepDetails({ prefill, onValidityChange, active = true, locale = 'en' }, ref) {
  const {
    register,
    trigger,
    getValues,
    formState: { errors, isValid },
  } = useForm<DetailsInput>({
    resolver: zodResolver(bookingDetailsSchema),
    mode: 'onChange',
    // Signed-in users start with their saved details; everything stays editable.
    defaultValues: {
      name: prefill?.name ?? '',
      phone: prefill?.phone ?? '',
      email: prefill?.email ?? '',
      notes: '',
    },
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
    <div className="step active" data-step="4">
      <h3 className="step__title">{t('Almost done — your details', locale)}</h3>
      <p className="step__hint">{t("We'll email your confirmation so you can find this booking anytime — and remind you the morning of.", locale)}</p>
      <div className="fields-2">
        <div className={`field${errors.name ? ' invalid' : ''}`} id="f-name">
          <label htmlFor="i-name">{t('Full name', locale)} <span className="req" aria-hidden="true">*</span></label>
          <input
            id="i-name"
            type="text"
            placeholder={t('e.g. Nimal Perera', locale)}
            autoComplete="name"
            className={errors.name ? 'err' : ''}
            disabled={!active}
            {...register('name')}
          />
          <div className="msg">{errors.name?.message ? t(errors.name.message, locale) : t('Please enter your name', locale)}</div>
        </div>
        <div className={`field${errors.phone ? ' invalid' : ''}`} id="f-phone">
          <label htmlFor="i-phone">{t('Mobile number', locale)} <span className="req" aria-hidden="true">*</span></label>
          <input
            id="i-phone"
            type="tel"
            placeholder="077 369 9620"
            autoComplete="tel"
            className={errors.phone ? 'err' : ''}
            disabled={!active}
            {...register('phone')}
          />
          <div className="msg">{errors.phone?.message ? t(errors.phone.message, locale) : t('Enter a valid Sri Lankan mobile number', locale)}</div>
        </div>
      </div>
      <div className={`field${errors.email ? ' invalid' : ''}`} id="f-email">
        <label htmlFor="i-email">{t('Email', locale)} <span className="req" aria-hidden="true">*</span></label>
        <input
          id="i-email"
          type="email"
          placeholder="you@email.com"
          autoComplete="email"
          className={errors.email ? 'err' : ''}
          disabled={!active}
          {...register('email')}
        />
        <div className="msg">{errors.email?.message ? t(errors.email.message, locale) : t('Please enter your email', locale)}</div>
      </div>
      <div className="field">
        <label htmlFor="i-notes">
          {t('Notes for your stylist', locale)}{' '}
          <span style={{ textTransform: 'none', letterSpacing: 0, color: 'var(--fg-muted)', fontWeight: 500 }}>
            {t('(optional)', locale)}
          </span>
        </label>
        <textarea
          id="i-notes"
          rows={2}
          placeholder={t('Shoulder length, keep the layers, a warm brown…', locale)}
          disabled={!active}
          {...register('notes')}
        />
      </div>
    </div>
  );
});
