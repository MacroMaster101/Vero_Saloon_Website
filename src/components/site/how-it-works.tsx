'use client';
import { useEffect, useRef, useState } from 'react';
import { ImgSlot } from '@/components/site/img-slot';

const VISUALS = ['Booking', 'Consultation', 'Wash & prep', 'Cut / colour', 'The reveal'];

const STEPS = [
  { n: 1, k: 'Book your slot', h: 'Pick a time', p: 'Choose your service, stylist and a time that fits — online, in under a minute. Walk-ins welcome too.' },
  { n: 2, k: 'Consultation', h: 'Tell us the look', p: "Show us a photo or just describe it — we'll advise what suits your hair, face and budget." },
  { n: 3, k: 'Wash & prep', h: 'Sit back', p: 'A relaxing wash and prep gets you comfortable before your stylist begins.' },
  { n: 4, k: 'Cut, colour or care', h: 'The magic', p: 'Cut, colour, beard, facial or bridal — your stylist takes their time to get it just right.' },
  { n: 5, k: 'Style & finish', h: 'Glow out', p: 'A final styling, a mirror check from every angle, and you walk out looking your absolute best.' },
];

export function HowItWorks() {
  const stepsRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const container = stepsRef.current;
    if (!container) return;
    const steps = Array.from(container.querySelectorAll<HTMLElement>('.how__step'));

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const mid = window.innerHeight / 2;
        let best = 0;
        let bestDist = Infinity;
        steps.forEach((s, i) => {
          const r = s.getBoundingClientRect();
          const c = r.top + r.height / 2;
          const d = Math.abs(c - mid);
          if (d < bestDist) {
            bestDist = d;
            best = i;
          }
        });
        setActive(best);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section className="section" id="how">
      <div className="wrap">
        <div className="sec-head reveal in">
          <div>
            <span className="eyebrow">How it works</span>
            <h2 className="h-section">Your visit, step by step</h2>
          </div>
          <p className="lead">
            From booking to the big reveal — here&apos;s how a visit to Vero Salon goes.
          </p>
        </div>

        <div className="how__grid">
          <div className="how__stick">
            <div className="how__visual" id="howVisual">
              {VISUALS.map((v, i) => (
                <div className={`vlayer${i === active ? ' on' : ''}`} data-i={i} key={v}>
                  <ImgSlot src={`/images/how/step-${i + 1}.png`} alt={v} />
                </div>
              ))}
              <div className="how__counter" id="howNum">
                {String(active + 1).padStart(2, '0')}
              </div>
            </div>
          </div>

          <div className="how__steps" id="howSteps" ref={stepsRef}>
            {STEPS.map((s, i) => (
              <div className={`how__step${i === active ? ' on' : ''}`} data-i={i} key={s.n}>
                <div className="k">
                  <span className="n">{s.n}</span> {s.k}
                </div>
                <h3>{s.h}</h3>
                <p>{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
