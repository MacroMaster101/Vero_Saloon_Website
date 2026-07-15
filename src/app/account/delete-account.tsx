'use client';
import { useActionState, useState } from 'react';
import { deleteMyAccount } from './actions';
import { t } from '@/lib/i18n/translations';

export function DeleteAccount({ locale = 'en' }: { locale?: string }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(deleteMyAccount, undefined);
  return (
    <section className="panel panel--danger account-panel">
      <h2>{t('Danger zone', locale)}</h2>
      <p className="step__hint">{t('Delete your account and personal data. Your past appointments are kept by the salon in anonymized form. This cannot be undone.', locale)}</p>
      {!open ? (
        <button type="button" className="btn btn--danger-outline" onClick={() => setOpen(true)}>{t('Delete my account & data', locale)}</button>
      ) : (
        <form action={action}>
          <div className="field"><label htmlFor="confirm">{t('Type DELETE to confirm', locale)}</label><input id="confirm" name="confirm" autoComplete="off" /></div>
          {state?.error && <p style={{ color: 'var(--error)', margin: '0 0 12px' }}>{state.error}</p>}
          <button type="submit" className="btn btn--primary" style={{ background: 'var(--error)' }}>{t('Permanently delete', locale)}</button>
        </form>
      )}
    </section>
  );
}
