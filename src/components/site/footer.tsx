import { BLOCK_DEFAULTS, type ContactContent } from '@/lib/content/blocks';

export function Footer({ content = BLOCK_DEFAULTS.contact }: { content?: ContactContent }) {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot__grid">
          <div className="foot__brand">
            <div className="brand" style={{ marginBottom: '16px' }}>
              <span className="brand__mark">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" width="30" height="30"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>
              </span>
              <span className="brand__name">VERO<span aria-hidden="true" style={{ color: 'var(--accent)' }}>✦</span><small>SALON · UNISEX</small></span>
            </div>
            <p>{content.footerBlurb}</p>
          </div>
          <div>
            <h5>Salon</h5>
            <ul>
              <li><a href="#services">Services</a></li>
              <li><a href="#destinations">Our Work</a></li>
              <li><a href="#team">Stylists</a></li>
              <li><a href="#book">Book now</a></li>
            </ul>
          </div>
          <div>
            <h5>Hours</h5>
            <ul>
              <li>Every day</li>
              <li>10:00 AM – 12:00 AM</li>
              <li>Walk-ins welcome</li>
            </ul>
          </div>
          <div>
            <h5>Contact</h5>
            <ul>
              <li><a href={`tel:${content.phonePrimary.replace(/\s/g, '')}`}>{content.phonePrimary}</a></li>
              <li><a href="tel:0710944410">071 094 4410</a></li>
              <li><a href={content.facebookUrl} target="_blank" rel="noopener">Facebook</a></li>
            </ul>
          </div>
        </div>
        <div className="foot__bottom">
          <span>© 2026 Vero Salon · Hair &amp; Beauty Unisex.</span>
          <span>{content.address} · {content.phonePrimary}</span>
        </div>
      </div>
    </footer>
  );
}
