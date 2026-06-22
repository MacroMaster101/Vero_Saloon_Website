import { BLOCK_DEFAULTS, type CtaContent } from '@/lib/content/blocks';

export function Cta({ content = BLOCK_DEFAULTS.cta }: { content?: CtaContent }) {
  return (
    <section className="section cta" id="cta">
      <div className="pl--sun" style={{ top: '-40px', right: '-40px', width: '280px', height: '280px' }}></div>
      <div className="wrap reveal" style={{ position: 'relative', zIndex: 2 }}>
        <h2 className="cta__title">{content.title}</h2>
        <p className="cta__sub">{content.sub}</p>
        <div className="cta__actions">
          <a href="#book" className="btn btn--primary btn--lg">Book your visit</a>
          <a href={content.phoneHref} className="btn btn--ghost-light btn--lg">{content.phoneLabel}</a>
        </div>
      </div>
    </section>
  );
}
