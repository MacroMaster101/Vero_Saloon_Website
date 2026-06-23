'use client';
import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { SplineHero } from './spline-hero';
import { BLOCK_DEFAULTS, type HeroContent } from '@/lib/content/blocks';

export function Hero({ content = BLOCK_DEFAULTS.hero }: { content?: HeroContent }) {
  const heroRef = useRef<HTMLElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 150, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 150, damping: 18 });

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { hero.classList.add('ehero--in'); return; }
    requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('ehero--in')));
  }, []);

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => { mx.set(0); my.set(0); };

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
            <a href="#services" className="ehero__link">Explore the menu <span aria-hidden="true">→</span></a>
          </div>
          <dl className="ehero__facts">
            <div><dt>Rated</dt><dd>4.9 ★ Google</dd></div>
            <div><dt>Open</dt><dd>Daily, 10–24</dd></div>
            <div><dt>For</dt><dd>Him &amp; Her</dd></div>
          </dl>
        </div>

        <motion.div className="ehero__stage" onPointerMove={onMove} onPointerLeave={onLeave}
          style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}>
          <span className="ehero__vlabel">Vero — Hair &amp; Beauty</span>
          <div className="ehero__frame">
            <SplineHero />
          </div>
          <span className="ehero__caption">01 — A studio built around you</span>
        </motion.div>
      </div>
      <div className="ehero__scroll"><span>Scroll</span><i /></div>
    </section>
  );
}
