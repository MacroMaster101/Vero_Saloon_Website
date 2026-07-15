'use client';
import Link from 'next/link';
import type { CreateResult } from '@/app/book/actions';
import { money } from '@/lib/format';
import { t } from '@/lib/i18n/translations';

type Success = Extract<CreateResult, { ok: true }>;

export function Confirmation({
  result,
  customerName,
  onRestart,
  locale = 'en',
}: {
  result: Success;
  customerName: string;
  onRestart: () => void;
  locale?: string;
}) {
  const firstName = customerName.trim().split(/\s+/)[0] || (locale === 'si' ? 'ඔබට' : 'there');
  return (
    <div className="step active" data-step="5">
      <div className="confirm">
        <div className="confirm__check">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3>{t("You're booked in.", locale)}</h3>
        <p id="confirmLine">
          {locale === 'si' 
            ? `ස්තූතියි ${firstName} — ඔබේ වෙන්කිරීම තහවුරු කර ඇත. ඔබේ යොමු අංකය ${result.reference} වේ. එය සුරක්ෂිතව තබාගන්න.`
            : `Thanks ${firstName} — your booking is confirmed. Your reference is ${result.reference}. Save it somewhere handy.`
          }
        </p>
        {result.isGuest && result.email && (
          <div className="confirm__claim">
            <b className="confirm__claim-title">
              <svg className="confirm__claim-ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              {t('Keep this booking safe', locale)}
            </b>
            <span className="confirm__claim-text">
              {locale === 'si'
                ? `මෙම වෙන්කිරීම ඕනෑම වේලාවක ඕනෑම උපාංගයකින් බැලීමට, වෙනස් කිරීමට හෝ අවලංගු කිරීමට ${result.email} සමඟ නොමිලේ ගිණුමක් සාදන්න.`
                : `Create a free account with ${result.email} to view, reschedule or cancel this visit anytime — from any device.`
              }
            </span>
            <Link
              className="btn btn--primary"
              href={`/signup?email=${encodeURIComponent(result.email)}&next=${encodeURIComponent('/')}`}
            >
              {t('Create my account', locale)}
            </Link>
          </div>
        )}
        <div className="confirm__ticket" id="ticket">
          <div className="sum-row">
            <span className="k">{result.serviceNames.length > 1 ? t('Services', locale) : t('Service', locale)}</span>
            <span className="v">
              {result.serviceNames.length > 1
                ? result.serviceNames.join(', ')
                : result.serviceName}
            </span>
          </div>
          <div className="sum-row">
            <span className="k">{t('Stylist', locale)}</span>
            <span className="v">{result.stylistName}</span>
          </div>
          <div className="sum-row">
            <span className="k">{t('When', locale)}</span>
            <span className="v">{result.whenLabel}</span>
          </div>
          <div className="sum-row">
            <span className="k">{t('Duration', locale)}</span>
            <span className="v">{result.durationMin} {t('min', locale)}</span>
          </div>
          <div className="sum-row">
            <span className="k">{t('Pay at salon', locale)}</span>
            <span className="v" style={{ color: 'var(--accent)' }}>
              {money(result.priceLkr)}
            </span>
          </div>
        </div>
        <button type="button" className="btn btn--ghost" id="restartBtn" onClick={onRestart}>
          {t('Book another visit', locale)}
        </button>
      </div>
    </div>
  );
}
