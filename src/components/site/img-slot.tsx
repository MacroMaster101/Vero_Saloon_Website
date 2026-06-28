'use client';

import { useState } from 'react';
import Image from 'next/image';

export function getFallbackImage(src: string | null | undefined, alt: string): string | null {
  if (src && src.trim() !== '') {
    return src;
  }

  const name = alt.toLowerCase();

  // 1. Stylist Avatars
  if (name.includes('ruwan')) return '/images/stylists/ruwan.png';
  if (name.includes('sanduni')) return '/images/stylists/sanduni.png';
  if (name.includes('tharindu')) return '/images/stylists/tharindu.png';
  if (name.includes('nadeesha')) return '/images/stylists/nadeesha.png';

  // 2. Lookbook / Gallery
  if (name.includes('ladies colour') || name.includes('balayage')) return '/images/lookbook/ladies-colour.png';
  if (name.includes('gents fade') || name.includes('gents cut')) return '/images/lookbook/gents-fade.png';
  if (name.includes('bridal')) return '/images/lookbook/bridal-look.png';
  if (name.includes('treatment') || name.includes('spa') || name.includes('hair treatment')) return '/images/lookbook/hair-spa.png';
  if (name.includes('beard') || name.includes('gents style')) return '/images/lookbook/beard-grooming.png';
  if (name.includes('facial') || name.includes('glow') || name.includes('clean-up')) return '/images/lookbook/facial-glow.png';

  // 3. How It Works Steps
  if (name.includes('booking') || name.includes('book your slot')) return '/images/how/step-1.png';
  if (name.includes('consultation')) return '/images/how/step-2.png';
  if (name.includes('wash') || name.includes('prep')) return '/images/how/step-3.png';
  if (name.includes('cut') || name.includes('colour') || name.includes('magic')) return '/images/how/step-4.png';
  if (name.includes('reveal') || name.includes('style & finish') || name.includes('glow out')) return '/images/how/step-5.png';

  // 4. Other site elements
  if (name.includes('interior') || name.includes('salon')) return '/images/story/interior.png';
  if (name.includes('map') || name.includes('find us')) return '/images/visit/map.png';

  return null;
}

export function ImgSlot({ src, alt, className, priority = false }: { src?: string | null; alt: string; className?: string; priority?: boolean }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imageSrc = getFallbackImage(src, alt);

  if (!imageSrc) {
    return (
      <div className={`img-slot img-slot--empty ${className ?? ''}`} role="img" aria-label={alt}>
        <span>{alt}</span>
      </div>
    );
  }

  return (
    <div className={`img-slot ${className ?? ''}`} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', backgroundColor: 'rgba(21, 13, 14, 0.3)' }}>
      {/* Skeleton / Blur Loading Placeholder */}
      {!isLoaded && (
        <div 
          style={{ 
            position: 'absolute', 
            inset: 0, 
            background: 'linear-gradient(90deg, rgba(212,176,94,0.05) 25%, rgba(212,176,94,0.12) 50%, rgba(212,176,94,0.05) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.6s infinite linear',
            zIndex: 1
          }}
        />
      )}
      
      <Image 
        src={imageSrc} 
        alt={alt} 
        fill 
        priority={priority}
        sizes="(max-width: 980px) 100vw, 33vw" 
        onLoad={() => setIsLoaded(true)}
        style={{ 
          objectFit: 'cover',
          opacity: isLoaded ? 1 : 0,
          transform: isLoaded ? 'scale(1)' : 'scale(1.03)',
          transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }} 
      />
    </div>
  );
}
