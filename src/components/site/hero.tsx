'use client';
import { useEffect, useRef } from 'react';
import { SplineHero } from './spline-hero';
import { BLOCK_DEFAULTS, type HeroContent } from '@/lib/content/blocks';

export function Hero({ content = BLOCK_DEFAULTS.hero }: { content?: HeroContent }) {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      hero.classList.add('ehero--in');
      return;
    }
    // staggered entrance (double-rAF so initial hidden state paints first)
    requestAnimationFrame(() =>
      requestAnimationFrame(() => hero.classList.add('ehero--in')),
    );

    // subtle parallax drift on the centerpiece
    const stage = hero.querySelector<HTMLElement>('.ehero__stage');
    if (!stage) return;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        stage.style.transform = `translateY(${window.scrollY * 0.08}px)`;
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section className="ehero" ref={heroRef}>
      <div className="wrap ehero__grid">
        <div className="ehero__copy">
          <span className="ehero__index">{content.eyebrow}</span>
          <h1 className="ehero__display">
            <span className="ln">{content.line1}</span>
            <span className="ln"><em>{content.line2Em}</em></span>
            <span className="ln">{content.line3}</span>
          </h1>
          <p className="ehero__lead">{content.lead}</p>
          <div className="ehero__actions">
            <a href="#book" className="btn btn--primary btn--lg">Reserve your visit</a>
            <a href="#services" className="ehero__link">
              Explore the menu <span aria-hidden="true">→</span>
            </a>
          </div>
          <dl className="ehero__facts">
            <div><dt>Rated</dt><dd>4.9 ★ Google</dd></div>
            <div><dt>Open</dt><dd>Daily, 10–24</dd></div>
            <div><dt>For</dt><dd>Him &amp; Her</dd></div>
          </dl>
        </div>

        <div className="ehero__stage">
          <span className="ehero__vlabel">Vero — Hair &amp; Beauty</span>
          <div className="ehero__frame">
            <SplineHero />
          </div>
          <span className="ehero__caption">01 — A studio built around you</span>
        </div>
      </div>

      <div className="ehero__scroll"><span>Scroll</span><i /></div>
    </section>
  );
}
