'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export function SplineHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse coordinate motion values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth spring physics for rotation
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [15, -15]), {
    damping: 25,
    stiffness: 150,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-15, 15]), {
    damping: 25,
    stiffness: 150,
  });

  // Smooth spring physics for glare position (numerical values)
  const springX = useSpring(useTransform(x, [-0.5, 0.5], [0, 100]), {
    damping: 25,
    stiffness: 150,
  });
  const springY = useSpring(useTransform(y, [-0.5, 0.5], [0, 100]), {
    damping: 25,
    stiffness: 150,
  });

  // Convert smoothed spring values to percentages
  const glareX = useTransform(springX, (val) => `${val}%`);
  const glareY = useTransform(springY, (val) => `${val}%`);

  // Calculate mouse position relative to the container center (-0.5 to 0.5)
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const relativeX = mouseX / rect.width - 0.5;
    const relativeY = mouseY / rect.height - 0.5;

    x.set(relativeX);
    y.set(relativeY);
  };

  // Reset rotation when mouse leaves
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div 
      className="splinehero splinehero--interactive" 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1200, display: 'grid', placeItems: 'center', height: '100%', width: '100%', position: 'relative' }}
    >
      <motion.div
        className="hero-tilt-card"
        style={{
          rotateX,
          rotateY,
          width: '100%',
          height: '100%',
          position: 'relative',
          borderRadius: '4px',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        {/* Main Centerpiece Image */}
        <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <Image 
            src="/images/story/interior.png" 
            alt="Vero Salon Atelier" 
            fill 
            sizes="(max-width: 920px) 100vw, 50vw"
            priority
            style={{ objectFit: 'cover' }}
          />
        </div>

        {/* Ambient Dark Overlay */}
        <div 
          style={{ 
            position: 'absolute', 
            inset: 0, 
            background: 'linear-gradient(to top, rgba(20, 13, 14, 0.85) 0%, rgba(20, 13, 14, 0.2) 60%, transparent 100%)',
            pointerEvents: 'none' 
          }} 
        />

        {/* Dynamic Light Glare */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle 220px at var(--glare-x, 50%) var(--glare-y, 50%), rgba(212, 176, 94, 0.15) 0%, transparent 80%)',
            pointerEvents: 'none',
            mixBlendMode: 'screen',
            // Cast to standard properties using custom styling variables mapped to motions
            ['--glare-x' as string]: glareX,
            ['--glare-y' as string]: glareY,
          }}
        />

        {/* Golden Border Glow */}
        <div 
          style={{ 
            position: 'absolute', 
            inset: 0, 
            border: '1px solid rgba(212, 176, 94, 0.25)', 
            borderRadius: '4px', 
            pointerEvents: 'none',
            boxShadow: 'inset 0 0 20px rgba(212, 176, 94, 0.1)'
          }} 
        />

        {/* Cinematic Card Content */}
        <div 
          style={{ 
            position: 'absolute', 
            bottom: '24px', 
            left: '24px', 
            right: '24px', 
            zIndex: 3, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '4px' 
          }}
        >
          <span 
            style={{ 
              fontSize: '10px', 
              fontWeight: 700, 
              letterSpacing: '0.24em', 
              color: 'var(--e-gold)', 
              textTransform: 'uppercase' 
            }}
          >
            Unisex Atelier
          </span>
          <h3 
            className="font-editorial" 
            style={{ 
              fontSize: '24px', 
              color: '#f4ece2', 
              margin: 0, 
              fontWeight: 400, 
              letterSpacing: '0.04em' 
            }}
          >
            Quiet Luxury.
          </h3>
        </div>
      </motion.div>
    </div>
  );
}
