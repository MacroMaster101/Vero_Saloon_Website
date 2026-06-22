'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import type { GalleryItem } from '@/lib/supabase/types';
import { ImgSlot } from '@/components/site/img-slot';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function Lookbook({ items }: { items: GalleryItem[] }) {
  const railRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollDist, setScrollDist] = useState(0);
  const [staticMode, setStaticMode] = useState(true);

  // Measure how far the track must move and whether we're in coverflow mode.
  useLayoutEffect(() => {
    const measure = () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const wide = window.innerWidth > 980;
      const active = wide && !reduced;
      setStaticMode(!active);
      const track = trackRef.current;
      if (track && active) {
        const dist = track.scrollWidth - window.innerWidth;
        setScrollDist(Math.max(0, dist));
      } else {
        setScrollDist(0);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [items.length]);

  // Pinned-scroll → horizontal translate of the track.
  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ['start start', 'end end'],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -scrollDist]);

  // Coverflow per-card transforms, driven by track motion + page scroll.
  const applyCoverflow = () => {
    const track = trackRef.current;
    if (!track) return;
    if (staticMode) return;
    const cards = track.querySelectorAll<HTMLElement>('.dcard');
    const mid = window.innerWidth / 2;
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const t = (rect.left + rect.width / 2 - mid) / window.innerWidth;
      const at = Math.abs(t);
      const ry = clamp(-t * 32, -34, 34);
      const sc = 1 - Math.min(at * 0.18, 0.2);
      const tz = -Math.min(at * 240, 220);
      card.style.transform = `translateZ(${tz}px) rotateY(${ry}deg) scale(${sc})`;
      card.style.zIndex = String(120 - Math.round(at * 120));
    });
  };

  useMotionValueEvent(x, 'change', () => applyCoverflow());

  useEffect(() => {
    if (staticMode) {
      // Clear any leftover transforms when falling back to flat rail.
      const track = trackRef.current;
      track?.querySelectorAll<HTMLElement>('.dcard').forEach((c) => {
        c.style.transform = '';
        c.style.zIndex = '';
      });
      return;
    }
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        applyCoverflow();
        ticking = false;
      });
    };
    applyCoverflow();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staticMode, scrollDist]);

  return (
    <section
      className={`rail${staticMode ? ' rail--static' : ''}`}
      id="destinations"
      ref={railRef}
      style={staticMode ? undefined : { height: `calc(100vh + ${scrollDist}px)` }}
    >
      <div className="wrap rail__head">
        <span className="eyebrow gold">Our Work</span>
        <h2 className="h-section">The lookbook</h2>
      </div>
      <div className="rail__pin" id="railPin">
        <motion.div
          className="rail__track"
          id="railTrack"
          ref={trackRef}
          style={staticMode ? undefined : { x }}
        >
          {items.map((item, i) => (
            <article className="dcard" key={item.id}>
              <span className="dcard__tag">{item.tag}</span>
              <ImgSlot src={item.image_url} alt={item.title} />
              <div className="dcard__grad" />
              <div className="dcard__body">
                <div className="dcard__num">{String(i + 1).padStart(2, '0')}</div>
                <div className="dcard__name">{item.title}</div>
                <div className="dcard__meta">{item.category}</div>
              </div>
            </article>
          ))}
        </motion.div>
        <div className="rail__hint">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>{' '}
          Keep scrolling to flip through the book
        </div>
      </div>
    </section>
  );
}
