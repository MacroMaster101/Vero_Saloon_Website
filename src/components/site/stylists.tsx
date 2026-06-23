import { getStylists } from '@/lib/queries';
import { ImgSlot } from '@/components/site/img-slot';

export async function Stylists() {
  const stylists = await getStylists();
  return (
    <section className="section" id="team" style={{ background: 'var(--bg-2)' }}>
      <div className="wrap">
        <div className="sec-head reveal">
          <div>
            <span className="eyebrow">The Team</span>
            <h2 className="h-section">Meet our stylists</h2>
          </div>
          <p className="lead">A friendly, skilled team for hair, colour and beauty — book by name, or let us match you with whoever&apos;s free.</p>
        </div>
        <div className="team reveal">
          {stylists.map((s, i) => (
            <article className={`barber${i === 0 ? ' barber--feature' : ''}`} key={s.id}>
              <ImgSlot src={s.avatar_url} alt={s.name} />
              <div className="barber__body">
                {i === 0 && <span className="barber__lead-tag">Lead stylist</span>}
                <h4>{s.name}</h4>
                <div className="barber__role">{s.role}</div>
                <div className="barber__tags">
                  {s.tags.map((t) => <span className="tag" key={t}>{t}</span>)}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
