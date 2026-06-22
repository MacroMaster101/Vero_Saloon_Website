'use client';
import type { CreateResult } from '@/app/book/actions';
import { money } from '@/lib/format';

type Success = Extract<CreateResult, { ok: true }>;

export function Confirmation({
  result,
  customerName,
  onRestart,
}: {
  result: Success;
  customerName: string;
  onRestart: () => void;
}) {
  const firstName = customerName.trim().split(/\s+/)[0] || 'there';
  return (
    <div className="step active" data-step="4">
      <div className="confirm">
        <div className="confirm__check">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3>You&apos;re booked in.</h3>
        <p id="confirmLine">
          Thanks {firstName} — we&apos;ve sent a confirmation and a reminder the morning of. Your reference is{' '}
          <strong>{result.reference}</strong>.
        </p>
        {result.isGuest && result.email && (
          <p className="confirm__hint">
            Booked as a guest? Create an account with <strong>{result.email}</strong> to see and manage this visit anytime.
          </p>
        )}
        <div className="confirm__ticket" id="ticket">
          <div className="sum-row">
            <span className="k">Service</span>
            <span className="v">{result.serviceName}</span>
          </div>
          <div className="sum-row">
            <span className="k">Stylist</span>
            <span className="v">{result.stylistName}</span>
          </div>
          <div className="sum-row">
            <span className="k">When</span>
            <span className="v">{result.whenLabel}</span>
          </div>
          <div className="sum-row">
            <span className="k">Duration</span>
            <span className="v">{result.durationMin} min</span>
          </div>
          <div className="sum-row">
            <span className="k">Pay at salon</span>
            <span className="v" style={{ color: 'var(--accent)' }}>
              {money(result.priceLkr)}
            </span>
          </div>
        </div>
        <button type="button" className="btn btn--ghost" id="restartBtn" onClick={onRestart}>
          Book another visit
        </button>
      </div>
    </div>
  );
}
