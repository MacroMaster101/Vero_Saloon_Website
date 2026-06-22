'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Ensure loader is not hidden by pre-existing class
    document.documentElement.classList.remove('loader-done');
    // Prevent body scrolling while loading is active
    document.body.style.overflow = 'hidden';

    let startTimestamp: number | null = null;
    const duration = 1800; // Shorter, sleeker luxury duration

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const currentProgress = Math.min(1, elapsed / duration);
      
      const easedProgress = Math.round(
        (1 - Math.pow(1 - currentProgress, 3)) * 100
      );
      
      setProgress(easedProgress);

      if (currentProgress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setTimeout(() => {
          setIsVisible(false);
          document.body.style.overflow = ''; // Restore scrolling
          
          // Add loader-done after exit animation finishes
          setTimeout(() => {
            document.documentElement.classList.add('loader-done');
          }, 1000);
        }, 200);
      }
    };

    const animId = window.requestAnimationFrame(step);
    return () => {
      window.cancelAnimationFrame(animId);
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="loader-overlay"
          initial={{ opacity: 1 }}
          exit={{
            y: '-100%',
            transition: { duration: 0.9, ease: [0.85, 0, 0.15, 1] }
          }}
        >
          {/* Animated Gold Ring Background Backgrounds */}
          <div className="loader-overlay__glow loader-overlay__glow--1" />
          <div className="loader-overlay__glow loader-overlay__glow--2" />
          
          <div className="loader-content">
            {/* Logo Drawing Animation */}
            <div className="loader-logo">
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="url(#goldGradient)" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="loader-logo__svg"
              >
                <defs>
                  <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#D4B05E" />
                    <stop offset="50%" stopColor="#F4EAE7" />
                    <stop offset="100%" stopColor="#C9A24B" />
                  </linearGradient>
                </defs>
                <motion.circle 
                  cx="6" 
                  cy="6" 
                  r="3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.8, ease: "easeInOut" }}
                />
                <motion.circle 
                  cx="6" 
                  cy="18" 
                  r="3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.8, ease: "easeInOut" }}
                />
                <motion.line 
                  x1="20" 
                  y1="4" 
                  x2="8.12" 
                  y2="15.88"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
                <motion.line 
                  x1="14.47" 
                  y1="14.48" 
                  x2="20" 
                  y2="20"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
                <motion.line 
                  x1="8.12" 
                  y1="8.12" 
                  x2="12" 
                  y2="12"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              </svg>
            </div>

            <motion.h1 
              className="loader-title font-editorial"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              VERO
            </motion.h1>
            
            <motion.p 
              className="loader-subtitle"
              initial={{ opacity: 0, letterSpacing: '0.1em' }}
              animate={{ opacity: 1, letterSpacing: '0.3em' }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              SALON · ATELIER
            </motion.p>
            
            {/* Number counter */}
            <div className="loader-progress">
              <span className="loader-progress__number">{progress}</span>
              <span className="loader-progress__pct">%</span>
            </div>
            
            {/* Progress track */}
            <div className="loader-track-wrapper">
              <motion.div 
                className="loader-track-bar" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
