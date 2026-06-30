import Link from 'next/link';
import type { ReactNode } from 'react';

export type LegalSection = { id: string; heading: string; body: ReactNode };

// Editorial two-column legal page: a warm banner, a sticky "contents" rail with
// a contact card (left), and the prose column (right). The rail is functional —
// it indexes the document and gives a way to reach the salon — so the width is
// used with purpose instead of leaving empty rails. Uses the site's Warm Modern
// tokens (Fraunces display ≥920px, Poppins body) for brand cohesion.
export function LegalPage({
  kicker,
  title,
  lead,
  updated,
  sections,
}: {
  kicker: string;
  title: string;
  lead: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <div className="home legal" id="top">
      <header className="legal-top">
        <div className="legal-wrap legal-top__inner">
          <Link className="home-brand" href="/" aria-label="Vero Salon home">
            <span className="home-brand__mark" aria-hidden="true">V</span>
            <span className="home-brand__name">
              <b>Vero Salon</b>
              <small>Unisex · Pasyala</small>
            </span>
          </Link>
          <Link className="legal-back" href="/">
            <span aria-hidden="true">←</span> Back to site
          </Link>
        </div>
      </header>

      {/* ── banner ── */}
      <section className="legal-banner">
        <div className="legal-wrap">
          <span className="legal-kicker">{kicker}</span>
          <h1 className="legal-title">{title}</h1>
          <p className="legal-lead">{lead}</p>
          <p className="legal-stamp">Last updated {updated}</p>
        </div>
      </section>

      {/* ── body: sticky index + prose ── */}
      <div className="legal-wrap legal-grid">
        <aside className="legal-rail">
          <nav className="legal-index" aria-label="On this page">
            <p className="legal-index__label">On this page</p>
            <ol>
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>
                    <span className="legal-index__n">{String(i + 1).padStart(2, '0')}</span>
                    {s.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="legal-help">
            <p className="legal-help__h">Questions?</p>
            <p className="legal-help__p">Talk to the salon — we&rsquo;re happy to help with any request.</p>
            <a className="legal-help__call" href="tel:0773699620">077 369 9620</a>
            <span className="legal-help__sub">Open daily · 10 AM – 12 AM</span>
          </div>
        </aside>

        <main className="legal-main">
          {sections.map((s) => (
            <section className="legal-section" id={s.id} key={s.id}>
              <h2 className="legal-h">{s.heading}</h2>
              <div className="legal-prose">{s.body}</div>
            </section>
          ))}
        </main>
      </div>

      <footer className="legal-foot">
        <div className="legal-wrap legal-foot__inner">
          <span>© 2026 Vero Salon Unisex · Pasyala</span>
          <span className="legal-foot__links">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/">Home</Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
