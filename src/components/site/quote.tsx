import { BLOCK_DEFAULTS, type QuoteContent } from '@/lib/content/blocks';

export function Quote({ content = BLOCK_DEFAULTS.quote }: { content?: QuoteContent }) {
  return (
    <section className="section quote">
      <div className="wrap reveal">
        <div className="stars">{content.stars}</div>
        <blockquote>{content.text}</blockquote>
        <div className="by">{content.by}</div>
      </div>
    </section>
  );
}
