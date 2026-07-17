'use client';

// App-level loading UI shown during route navigation / server data fetches.
// A trimmed version of the homepage splash — the Cyber Gothic brand badge + spinner.
import { useEffect, useState } from 'react';
import { LogoIcon } from '@/components/ui/logo-icon';

export default function Loading() {
  const [isSinhala, setIsSinhala] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSinhala(document.cookie.includes('locale=si'));
  }, []);

  return (
    <div className="home-route-loader" role="status" aria-label="Loading">
      <div className="home-loader-badge">
        <span className="home-loader-ring home-loader-ring--outer" />
        <span className="home-loader-ring home-loader-ring--inner" />
        <span className="home-loader-mark" style={{ display: 'grid', placeItems: 'center' }}>
          <LogoIcon />
        </span>
      </div>
      <span className="home-loader-sub">
        {isSinhala ? 'පූරණය වෙමින් පවතී...' : 'Loading'}
      </span>
    </div>
  );
}
