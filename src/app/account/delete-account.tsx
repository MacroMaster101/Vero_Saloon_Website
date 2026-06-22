'use client';
import { useActionState, useState } from 'react';
import { deleteMyAccount } from './actions';

export function DeleteAccount() {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(deleteMyAccount, undefined);
  return (
    <section className="panel panel--danger account-panel">
      <h2>Danger zone</h2>
      <p className="step__hint">Delete your account and personal data. Your past appointments are kept by the salon in anonymized form. This cannot be undone.</p>
      {!open ? (
        <button type="button" className="btn btn--danger-outline" onClick={() => setOpen(true)}>Delete my account &amp; data</button>
      ) : (
        <form action={action}>
          <div className="field"><label htmlFor="confirm">Type DELETE to confirm</label><input id="confirm" name="confirm" autoComplete="off" /></div>
          {state?.error && <p style={{ color: 'var(--error)', margin: '0 0 12px' }}>{state.error}</p>}
          <button type="submit" className="btn btn--primary" style={{ background: 'var(--error)' }}>Permanently delete</button>
        </form>
      )}
    </section>
  );
}
