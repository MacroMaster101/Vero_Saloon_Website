'use client';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function MagneticButton({
  href, className, children,
}: { href: string; className?: string; children: React.ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 250, damping: 20 });
  const sy = useSpring(y, { stiffness: 250, damping: 20 });

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.3);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.3);
  };
  const reset = () => { x.set(0); y.set(0); };

  return (
    <motion.a href={href} className={className} style={{ x: sx, y: sy }}
      onPointerMove={onMove} onPointerLeave={reset}>
      {children}
    </motion.a>
  );
}
