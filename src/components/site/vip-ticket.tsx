export function VipTicket({ ctaHref }: { ctaHref: string }) {
  return (
    <a className="vip" href={ctaHref} aria-label="Book your appointment">
      <span className="vip__hole vip__hole--top" aria-hidden="true" />
      <span className="vip__hole vip__hole--bot" aria-hidden="true" />
      <div className="vip__badge">
        <span className="vip__spark" aria-hidden="true">✦</span>
      </div>
      <div className="vip__body">
        <span className="vip__eyebrow">Vero salon</span>
        <h2 className="vip__title">Ready for a refresh?</h2>
        <p className="vip__sub">Book your next appointment in just a few taps.</p>
        <span className="vip__cta">Book appointment <span aria-hidden="true">→</span></span>
      </div>
    </a>
  );
}
