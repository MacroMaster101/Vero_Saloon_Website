'use client';
import Link from 'next/link';
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
    <div className="step active" data-step="5">
      <div className="confirm">
        <div className="confirm__check">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3>You&apos;re booked in.</h3>
        <p id="confirmLine">
          Thanks {firstName} — your booking is confirmed. Your reference is{' '}
          <strong>{result.reference}</strong>. Save it somewhere handy.
        </p>
        {result.isGuest && result.email && (
          <div className="confirm__claim">
            <b className="confirm__claim-title">
              <svg className="confirm__claim-ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              Keep this booking safe
            </b>
            <span className="confirm__claim-text">
              Create a free account with <strong>{result.email}</strong> to view, reschedule or cancel this visit anytime — from any device.
            </span>
            <Link
              className="btn btn--primary"
              href={`/signup?email=${encodeURIComponent(result.email)}&next=${encodeURIComponent('/account')}`}
            >
              Create my account
            </Link>
          </div>
        )}
        <div className="confirm__ticket" id="ticket">
          <div className="sum-row">
            <span className="k">{result.serviceNames.length > 1 ? 'Services' : 'Service'}</span>
            <span className="v">
              {result.serviceNames.length > 1
                ? result.serviceNames.join(', ')
                : result.serviceName}
            </span>
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
