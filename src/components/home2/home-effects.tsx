'use client';

import { useEffect, useState } from 'react';

const SECTIONS = [
  { id: 'top', label: 'Home' },
  { id: 'how', label: 'How it works' },
  { id: 'services', label: 'Services' },
  { id: 'looks', label: 'Lookbook' },
  { id: 'team', label: 'Stylists' },
  { id: 'faq', label: 'FAQ' },
  { id: 'visit', label: 'Visit' },
];

export function HomeEffects() {
  const [activeSection, setActiveSection] = useState('top');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

      // 2. Active section highlights
      let current = 'top';
      const spyOffset = window.innerHeight * 0.4; // 40% of viewport height
      const scrollPos = window.scrollY + spyOffset;
      
      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          if (scrollPos >= el.offsetTop) {
            current = section.id;
          }
        }
      }
      
      // Fallback: force last section when scrolled to absolute bottom
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 40) {
        current = 'visit';
      }
      
      setActiveSection(current);

      // 3. Scroll progress percentage
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

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
      if (io) io.disconnect();
    };
  }, []);

  // Update header desktop links active state
  useEffect(() => {
    const navLinks = document.querySelectorAll('.v2-nav a');
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === `#${activeSection}` || (activeSection === 'top' && href === '#top')) {
        link.classList.add('is-active');
      } else {
        link.classList.remove('is-active');
      }
    });
  }, [activeSection]);

  const handleDotClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const offset = id === 'top' ? 0 : el.offsetTop - 76;
      window.scrollTo({
        top: offset,
        behavior: 'smooth',
      });
    }
  };

  if (!mounted) return null;

  return (
    <>
      {/* ── Top Scroll Progress Bar ── */}
      <div 
        className="v2-scroll-progress" 
        style={{ width: `${scrollProgress}%` }} 
      />

      {/* ── Floating Desktop Side Dots Navigator ── */}
      <nav className="v2-dots-nav" aria-label="Section navigation">
        {SECTIONS.map((sec) => (
          <a
            key={sec.id}
            href={`#${sec.id}`}
            onClick={(e) => handleDotClick(e, sec.id)}
            className={`v2-dot-nav-item ${activeSection === sec.id ? 'is-active' : ''}`}
            title={sec.label}
          >
            <span className="dot" />
            <span className="label">{sec.label}</span>
          </a>
        ))}
      </nav>

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

