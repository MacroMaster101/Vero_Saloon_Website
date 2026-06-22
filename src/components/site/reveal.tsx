'use client';
import { useEffect, useRef, useState } from 'react';

export function Reveal({
  children,
  className = '',
  delay,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: 1 | 2 | 3;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Reduced motion / no-IO: reveal immediately so content is never hidden.
      Promise.resolve().then(() => setSeen(true));
      return;
    }
    if (!('IntersectionObserver' in window)) {
      Promise.resolve().then(() => setSeen(true));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setSeen(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${seen ? 'in' : ''} ${className}`} data-d={delay}>
      {children}
    </div>
  );
}
