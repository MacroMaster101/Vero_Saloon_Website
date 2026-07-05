'use client';
import { Modal } from '@/components/ui/modal';

// In-app replacement for window.confirm: shows who/when before a destructive
// staff action (cancel, no-show).
export function ConfirmSheet({
  open, title, body, confirmLabel, danger = false, busy = false, onConfirm, onClose,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="pm__hint" style={{ fontSize: 14, marginTop: 4 }}>{body}</p>
      <div className="pm__foot" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn--ghost" onClick={onClose} disabled={busy}>Keep it</button>
        <button
          type="button"
          className="btn btn--primary"
          style={danger ? { background: 'var(--error)', borderColor: 'var(--error)' } : undefined}
          onClick={onConfirm}
          disabled={busy}
        >
          {busy ? 'Working…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
