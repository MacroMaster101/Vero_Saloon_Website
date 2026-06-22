import { Reveal } from '@/components/site/reveal';
import { BLOCK_DEFAULTS, type StatsContent } from '@/lib/content/blocks';

export function Stats({ content = BLOCK_DEFAULTS.stats }: { content?: StatsContent }) {
  return (
    <section
      className="section"
      style={{
        paddingTop: 'clamp(56px,7vw,90px)',
        paddingBottom: 'clamp(56px,7vw,90px)',
      }}
    >
      <div className="wrap">
        <div className="stats">
          {content.cards.map((card, i) => {
            // Reveal's stagger delay is a 1|2|3 literal; first card has no delay.
            const delay = i === 1 ? 1 : i === 2 ? 2 : i >= 3 ? 3 : undefined;
            return (
              <Reveal key={i} delay={delay}>
                <div className="stat-card">
                  <b>{card.value}</b>
                  <span>{card.label}</span>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
