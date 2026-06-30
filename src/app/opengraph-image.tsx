import { ImageResponse } from 'next/og';

// Branded social-share card (WhatsApp / Facebook / X link previews).
// Rendered at the standard 1200×630 OG size.
export const runtime = 'edge';
export const alt = 'Vero Salon — Hair & Beauty Unisex · Pasyala';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: 'linear-gradient(135deg, #1C1611 0%, #2A2018 55%, #3a2a14 120%)',
          color: '#FAF6EF',
          fontFamily: 'sans-serif',
        }}
      >
        {/* brand row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #D99A3D, #B8742A)',
              color: '#fff',
              fontSize: 60,
              fontStyle: 'italic',
              fontWeight: 700,
            }}
          >
            V
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: 1 }}>Vero Salon</div>
            <div style={{ fontSize: 20, letterSpacing: 6, color: '#E8B05A', textTransform: 'uppercase' }}>
              Unisex · Pasyala
            </div>
          </div>
        </div>

        {/* headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.05 }}>The art of</div>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.05, color: '#E8B05A', fontStyle: 'italic' }}>
            looking remarkable.
          </div>
        </div>

        {/* footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 24, color: 'rgba(250,246,239,0.78)' }}>
          <span>Hair · Colour · Beauty · Bridal</span>
          <span>4.9 ★ · Open until midnight</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
