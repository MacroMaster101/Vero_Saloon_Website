import { Reveal } from '@/components/site/reveal';
import { BLOCK_DEFAULTS, type StatsContent } from '@/lib/content/blocks';

export function Stats({ content = BLOCK_DEFAULTS.stats }: { content?: StatsContent }) {
  return (
    <section
      className="section stats-band"
      style={{
        paddingTop: 'clamp(48px,6vw,80px)',
        paddingBottom: 'clamp(48px,6vw,80px)',
      }}
    >
      <div className="wrap">
        <div className="stats">
          {content.cards.length > 0 && (
            <Reveal>
              <div className="stat-hero">
                <b>{content.cards[0]!.value}</b>
                <span>{content.cards[0]!.label}</span>
              </div>
            </Reveal>
          )}
          <div className="stats__rest">
            {content.cards.slice(1).map((card, i) => {
              const delay = i === 0 ? 1 : i === 1 ? 2 : 3;
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
      </div>
    </section>
  );
}
