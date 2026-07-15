'use client';

import { t } from '@/lib/i18n/translations';

export function ComingSoon({ locale = 'en' }: { locale?: string }) {
  return (
    <div className="home-modal__body home-modal__body--done">
      <div className="confirm" style={{ padding: '24px 8px', textAlign: 'center' }}>
        <div 
          className="confirm__check" 
          style={{ 
            background: 'var(--accent-tint)', 
            color: 'var(--accent)', 
            width: '64px', 
            height: '64px',
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto 20px',
            border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)'
          }}
        >
          <svg 
            width="32" 
            height="32" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
          </svg>
        </div>

        <h3 style={{ 
          fontSize: '22px', 
          fontWeight: 800, 
          color: 'var(--fg)', 
          marginBottom: '10px',
          background: 'var(--grad-gold)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'inline-block'
        }}>
          {t('Online Booking Coming Soon', locale)}
        </h3>
        
        <p style={{ 
          fontSize: '14.5px', 
          color: 'var(--fg-2)', 
          lineHeight: '1.6', 
          maxWidth: '420px',
          margin: '0 auto 28px'
        }}>
          {t('We are putting the final touches on our online booking platform. In the meantime, you can schedule your visit by calling us or sending a message on WhatsApp!', locale)}
        </p>

        {/* ── Contact Options ── */}
        <div style={{ display: 'grid', gap: '12px', maxWidth: '380px', margin: '0 auto 24px' }}>
          {/* WhatsApp Direct */}
          <a 
            href="https://wa.me/94773699620?text=Hi%20Vero%20Salon%2C%20I'd%20like%20to%20book%20an%20appointment!" 
            target="_blank" 
            rel="noopener noreferrer"
            className="home-btn home-btn--primary"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '10px',
              padding: '12px 20px',
              fontSize: '14.5px',
              fontWeight: 700,
              width: '100%',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            {t('Message on WhatsApp', locale)}
          </a>

          {/* Call option */}
          <a 
            href="tel:0773699620" 
            className="home-btn home-btn--ghost"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '10px',
              padding: '12px 20px',
              fontSize: '14.5px',
              fontWeight: 600,
              width: '100%',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--line)',
              background: 'var(--surface)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            {t('Call Salon (077 369 9620)', locale)}
          </a>
        </div>

        {/* ── Salon Info ── */}
        <div 
          style={{ 
            fontSize: '13px', 
            color: 'var(--fg-muted)', 
            borderTop: '1px solid var(--line)', 
            paddingTop: '16px',
            marginTop: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
            <span>📍</span>
            <span>{t('Attanagalla Road, Pasyala', locale)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <span>🕙</span>
            <span>{t('Open Daily: 10:00 AM – 12:00 AM', locale)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
