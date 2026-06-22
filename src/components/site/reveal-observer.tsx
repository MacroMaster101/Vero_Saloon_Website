'use client';
import { useEffect } from 'react';

// Global reveal-on-scroll: adds `.in` to every `.reveal` element as it enters
// the viewport. Server Components render static `className="reveal"` markup
// (which is `opacity:0` in CSS), so without this they'd stay invisible. This
// mirrors the reference site's IntersectionObserver in salon-booking.js.
//
// Fail-safe: if IntersectionObserver is missing or reduced-motion is on, every
// `.reveal` is shown immediately so content is never permanently hidden.
export function RevealObserver() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    if (els.length === 0) return;

    const reveal = (el: Element) => el.classList.add('in');

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) {
      els.forEach(reveal);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            reveal(e.target);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    els.forEach((el) => {
      // Anything already in view (above the fold) reveals on the first tick.
      io.observe(el);
    });

    // Safety net: if for any reason an element never triggers (e.g. it's in a
    // sticky/transformed ancestor the observer mismeasures), reveal everything
    // still hidden shortly after load so nothing stays invisible.
    const t = window.setTimeout(() => {
      els.forEach((el) => {
        if (!el.classList.contains('in')) reveal(el);
      });
    }, 2500);

    return () => {
      io.disconnect();
      window.clearTimeout(t);
    };
  }, []);

  return null;
}
