'use client';

import { useEffect, useState } from 'react';

/* Must be in true DOM (top-to-bottom) order so the scroll-spy lights up the
   right link. These ids mirror NAV_LINKS in page.tsx (plus 'top' for the hero). */
const SECTIONS = [
  { id: 'top', label: 'Home' },
  { id: 'about', label: 'Story' },
  { id: 'services', label: 'Services' },
  { id: 'how', label: 'How it works' },
  { id: 'looks', label: 'Lookbook' },
  { id: 'team', label: 'Stylists' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'faq', label: 'FAQ' },
  { id: 'visit', label: 'Visit' },
];

export function HomeEffects() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Always open at the very top on (re)load — stop the browser from
    // restoring the previous scroll position, then pin to top.
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }

    // Simulating initial component mount loading for luxury splash screen
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const header = document.querySelector('.v2-header');
    
    const onScroll = () => {
      // 1. Toggle scrolled header background
      if (header) {
        header.classList.toggle('is-scrolled', window.scrollY > 12);
      }

      // 2. Active section highlights — viewport-relative, robust top→bottom.
      // A section is "current" once its top crosses a line ~32% down the screen
      // (just below the sticky pill). Iterating in DOM order, the last match wins.
      let current = 'top';
      const line = window.innerHeight * 0.32;

      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el && el.getBoundingClientRect().top <= line) {
          current = section.id;
        }
      }

      // Fallback: force the last nav section when scrolled to the very bottom,
      // so short final sections still light their link.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = SECTIONS[SECTIONS.length - 1]?.id ?? current;
      }

      // Apply active class directly — robust against nav re-renders.
      const navLinks = document.querySelectorAll('.v2-nav a');
      navLinks.forEach((link) => {
        const href = link.getAttribute('href');
        link.classList.toggle('is-active', href === `#${current}`);
      });

      // 3. Scroll progress percentage
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Smooth-scroll in-page #links, offset for the floating pill, keep the #hash.
    const onAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!target) return;
      const hash = target.getAttribute('href') ?? '';
      const id = hash.slice(1);
      if (!id) return;
      const el = id === 'top' ? document.body : document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      const y = id === 'top' ? 0 : el.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({ top: y, behavior: 'smooth' });
      history.replaceState(null, '', hash); // reflect #section in the URL
    };
    document.addEventListener('click', onAnchorClick);

    // 4. Reveal elements in viewport
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const items = Array.from(document.querySelectorAll<HTMLElement>('.v2-reveal'));
    
    let io: IntersectionObserver | null = null;
    if (reduce) {
      items.forEach((el) => el.classList.add('is-in'));
    } else {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('is-in');
              io?.unobserve(e.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -5% 0px' },
      );
      items.forEach((el) => io?.observe(el));
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('click', onAnchorClick);
      if (io) io.disconnect();
    };
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* ── Top Scroll Progress Bar ── */}
      <div
        className="v2-scroll-progress"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* ── Luxury Load Splash Screen ── */}
      {loading && (
        <div className="v2-page-loader">
          <div className="v2-loader-content">
            <span className="v2-loader-logo">V</span>
            <div className="v2-loader-ring" />
            <span className="v2-loader-text">Vero Salon</span>
          </div>
        </div>
      )}
    </>
  );
}

