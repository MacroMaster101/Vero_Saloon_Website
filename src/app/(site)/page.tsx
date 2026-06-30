import { BookingProvider } from '@/components/booking/booking-provider';
import { BookButton } from '@/components/site/book-button';
import { Faq } from '@/components/home/faq';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { NavAuth } from '@/components/site/nav-auth';
import { LiveStatus } from '@/components/site/live-status';
import { ImgSlot } from '@/components/site/img-slot';
import { ServicesTabs } from '@/components/home/services-tabs';
import { HomeEffects } from '@/components/home/home-effects';
import { BottomNav } from '@/components/home/bottom-nav';
import { minutesToLabel } from '@/lib/format';
import { ratingLabel, stylistAvatarSrc } from '@/lib/stylist-card';
import { getSiteContent } from '@/lib/content/get';
import { getProfile } from '@/lib/supabase/auth';
import { avatarSrc } from '@/lib/avatar';
import { createClient } from '@/lib/supabase/server';
import {
  getBookableServices,
  getGallery,
  getStylists,
  getRecentReviews,
  getBusinessHours,
} from '@/lib/queries';
import type { Service } from '@/lib/supabase/types';

// One link per on-page section, in DOM (top→bottom) order so the scroll-spy
// highlight moves left → right as you scroll. Keep these ids in sync with the
// section ids in this file AND with SECTIONS in home-effects.tsx.
const NAV_LINKS = [
  { href: '#about', label: 'Story' },
  { href: '#services', label: 'Services' },
  { href: '#how', label: 'How it works' },
  { href: '#looks', label: 'Lookbook' },
  { href: '#team', label: 'Stylists' },
  { href: '#reviews', label: 'Reviews' },
  { href: '#faq', label: 'FAQ' },
  { href: '#visit', label: 'Visit' },
];

const STRIP = ['Hair', 'Colour & balayage', 'Beard grooming', 'Facials', 'Bridal', 'Hair spa', 'Threading', 'Waxing'];

const STEPS = [
  { h: 'Book a slot', p: 'Pick a service, a stylist and a time online — in under a minute. Walk-ins welcome too.' },
  { h: 'Consultation', p: 'Show a photo or describe the look. We advise what suits your hair, face and budget.' },
  { h: 'Sit back', p: 'A relaxing wash and prep gets you comfortable before your stylist begins.' },
  { h: 'Style & finish', p: 'A final styling, a mirror check from every angle, and you walk out looking your best.' },
];

const FAQS = [
  { q: 'Do you take walk-ins?', a: 'Yes — walk-ins are always welcome. Booking ahead just guarantees your preferred stylist and time.' },
  { q: 'Is a deposit required to book?', a: 'No deposit and no account needed. Just pick a service, a stylist and a time.' },
  { q: 'Where can I park?', a: 'Street parking is available right by the salon in Pasyala.' },
  { q: 'Do you do bridal and party makeup?', a: 'Yes — we offer full bridal hair and makeup as well as occasion styling. Ask at your consultation.' },
  { q: 'What are your opening hours?', a: 'We are open daily from 10 AM until midnight. See the Visit section for the full week.' },
];

const DAYS = [
  { dow: 1, label: 'Monday' },
  { dow: 2, label: 'Tuesday' },
  { dow: 3, label: 'Wednesday' },
  { dow: 4, label: 'Thursday' },
  { dow: 5, label: 'Friday' },
  { dow: 6, label: 'Saturday' },
  { dow: 0, label: 'Sunday' },
];

const reviewDate = new Intl.DateTimeFormat('en-LK', { day: 'numeric', month: 'short', year: 'numeric' });

function featuredOf(services: Service[]): Service | null {
  return (
    services.find((s) => s.is_featured) ??
    [...services].sort((a, b) => b.price_lkr - a.price_lkr)[0] ??
    null
  );
}

export default async function Home({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const sp = await searchParams;
  const deleted = sp.deleted === '1';

  const [services, stylists, gallery, reviews, hours, hero, story, stats, cta, contact, profile] =
    await Promise.all([
      getBookableServices(),
      getStylists(),
      getGallery(),
      getRecentReviews(),
      getBusinessHours(),
      getSiteContent('hero'),
      getSiteContent('story'),
      getSiteContent('stats'),
      getSiteContent('cta'),
      getSiteContent('contact'),
      getProfile(),
    ]);

  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  const userMetadata = user?.user_metadata ?? null;

  const hair = services.filter((s) => s.category === 'hair');
  const beauty = services.filter((s) => s.category === 'beauty');
  const featured = featuredOf(services);
  const looks = gallery.slice(0, 5);
  const isCustomer = profile?.role !== 'admin' && profile?.role !== 'staff';
  const hoursByDow = new Map(hours.map((h) => [h.day_of_week, h]));

  // Account tab for the mobile bottom bar — mirror NavAuth's routing/avatar.
  const accountHref = !profile
    ? '/login'
    : profile.role === 'admin'
      ? '/admin'
      : profile.role === 'staff'
        ? '/admin/schedule'
        : '/account';
  const accountLabel = profile?.role === 'staff' ? 'Schedule' : profile?.role === 'admin' ? 'Admin' : 'Account';
  const accountAvatar = profile ? avatarSrc(userMetadata, profile.email ?? profile.fullName ?? 'guest') : null;

  return (
    <BookingProvider services={services} stylists={stylists} enabled={isCustomer}>
      <div className="home" id="top">
        <HomeEffects />

        {deleted && (
          <div
            role="status"
            style={{ background: 'var(--accent-tint)', color: 'var(--fg)', textAlign: 'center', padding: '12px 16px', fontSize: 14 }}
          >
            Your account and personal data have been deleted. Thank you for visiting Vero Salon.
          </div>
        )}

        {/* ── header ── */}
        <header className="home-header">
          <div className="home-wrap home-header__inner">
            <a className="home-brand" href="#top" aria-label="Vero Salon home">
              <span className="home-brand__mark" aria-hidden="true">V</span>
              <span className="home-brand__name">
                <b>Vero Salon</b>
                <small>Unisex · Pasyala</small>
              </span>
            </a>

            <nav className="home-nav" aria-label="Primary">
              {NAV_LINKS.map((l) => (
                <a key={l.href} href={l.href}>{l.label}</a>
              ))}
            </nav>

            <div className="home-header__actions">
              <ThemeToggle />
              <NavAuth profile={profile} userMetadata={userMetadata} />
              <BookButton variant="primary" className="home-header__book">Book now</BookButton>
            </div>
          </div>
        </header>

        <main>
          {/* ── hero ── */}
          <section className="home-hero">
            <div className="home-wrap home-hero__grid">
              <div className="home-reveal">
                <span className="home-eyebrow">{hero.eyebrow}</span>
                <h1 className="home-hero__display">
                  <span className="ln">{hero.line1}</span>
                  <span className="ln"><em>{hero.line2Em}</em></span>
                  <span className="ln">{hero.line3}</span>
                </h1>
                <p className="home-hero__lead">{hero.lead}</p>
                <div className="home-hero__actions">
                  <BookButton variant="primary">Book a visit</BookButton>
                  <a className="home-link" href="#services">See the menu <span aria-hidden="true">→</span></a>
                </div>
                <dl className="home-hero__facts">
                  <div>
                    <dt>Google rating</dt>
                    <dd>4.9 ★ · 120+</dd>
                  </div>
                  <div>
                    <dt>Open daily</dt>
                    <dd>10 AM – 12 AM</dd>
                  </div>
                  <div>
                    <dt>For</dt>
                    <dd>Him &amp; her</dd>
                  </div>
                </dl>
              </div>

              <div className="home-hero__media home-reveal">
                <span className="home-hero__pole" aria-hidden="true" />
                <div className="home-hero__frame">
                  <ImgSlot src="/images/story/interior.png" alt="Vero Salon interior" priority={true} />
                </div>
                <div className="home-hero__badge">
                  <span className="home-dot" aria-hidden="true" />
                  <span>
                    <b>Open until midnight</b>
                    <span style={{ display: 'block' }}>Walk-ins welcome</span>
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ── trust strip ── */}
          <div className="home-strip" aria-hidden="true">
            <div className="home-strip__track">
              <span>{STRIP.map((s) => <span key={s}>{s}</span>)}</span>
              <span>{STRIP.map((s) => <span key={`b-${s}`}>{s}</span>)}</span>
            </div>
          </div>

          {/* ── story / about ── */}
          <section className="home-section home-story" id="about">
            <div className="home-wrap home-story__grid">
              <div className="home-story__art home-reveal">
                <ImgSlot src="/images/story/interior.png" alt="Inside Vero Salon" />
              </div>
              <div className="home-reveal">
                <span className="home-eyebrow">{story.eyebrow}</span>
                <h2 className="home-h">{story.heading}</h2>
                {story.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
                <div className="home-story__stats">
                  {stats.cards.slice(0, 3).map((c, i) => (
                    <div key={i}>
                      <b>{c.value}</b>
                      <span>{c.label}</span>
                    </div>
                  ))}
                </div>
                <p className="home-story__sign">{story.sign}</p>
              </div>
            </div>
          </section>

          {/* ── services / pricing ── */}
          <section className="home-section" id="services">
            <div className="home-wrap">
              <div className="home-head home-reveal">
                <span className="home-eyebrow home-eyebrow--center">The menu</span>
                <h2 className="home-h">Services &amp; <em>pricing</em></h2>
                <p className="home-lead">Hair, colour and beauty for everyone. Prices in LKR — final quote confirmed at your consultation.</p>
              </div>
              <div className="home-reveal">
                <ServicesTabs hair={hair} beauty={beauty} featured={featured} />
              </div>
            </div>
          </section>

          {/* ── how it works ── */}
          <section className="home-section home-how" id="how">
            <div className="home-wrap">
              <div className="home-head home-reveal">
                <span className="home-eyebrow home-eyebrow--center">How it works</span>
                <h2 className="home-h">Your visit, <em>step by step</em></h2>
                <p className="home-lead">From booking to the final mirror check — here is exactly what to expect.</p>
              </div>
              <div className="home-steps home-car">
                {STEPS.map((s) => (
                  <div className="home-step home-reveal" key={s.h}>
                    <div className="home-step__n" aria-hidden="true" />
                    <h3>{s.h}</h3>
                    <p>{s.p}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── lookbook ── */}
          {looks.length > 0 && (
            <section className="home-section home-story" id="looks" style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--line)' }}>
              <div className="home-wrap">
                <div className="home-head home-reveal">
                  <span className="home-eyebrow home-eyebrow--center">Our work</span>
                  <h2 className="home-h">The <em>lookbook</em></h2>
                  <p className="home-lead">A glimpse of the cuts, colour and care that walk out our door.</p>
                </div>
                <div className="home-look home-car">
                  {looks.map((item) => (
                    <article className="home-look__item home-reveal" key={item.id}>
                      <ImgSlot src={item.image_url} alt={item.title} />
                      <span className="home-look__tag">{item.tag}</span>
                      <div className="home-look__grad" />
                      <div className="home-look__cap">
                        <b>{item.title}</b>
                        <span>{item.category}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── team / stylists ── */}
          {stylists.length > 0 && (
            <section className="home-section" id="team">
              <div className="home-wrap">
                <div className="home-head home-reveal">
                  <span className="home-eyebrow home-eyebrow--center">The artisans</span>
                  <h2 className="home-h">Meet our <em>stylists</em></h2>
                  <p className="home-lead">A friendly, trained team dedicated to hair craft, colour and beauty care.</p>
                </div>
                <div className="home-team home-car home-car--narrow">
                  {stylists.map((s) => {
                    const rating = ratingLabel(s.rating, s.rating_count);
                    return (
                      <article className="home-member home-reveal" key={s.id}>
                        <div className="home-member__photo">
                          <ImgSlot src={stylistAvatarSrc(s)} alt={s.name} />
                        </div>
                        <h3>{s.name}</h3>
                        <div className="home-member__role">{s.role}</div>
                        <div className="home-member__rating">{rating.stars}{rating.reviews ? ` ${rating.reviews}` : ''}</div>
                        {s.tags.length > 0 && (
                          <div className="home-member__tags">
                            {s.tags.slice(0, 3).map((t) => <span className="home-tag" key={t}>{t}</span>)}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* ── reviews ── */}
          {reviews.length > 0 && (
            <section className="home-section home-story" id="reviews" style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--line)' }}>
              <div className="home-wrap">
                <div className="home-head home-reveal">
                  <span className="home-eyebrow home-eyebrow--center">Client voices</span>
                  <h2 className="home-h">What guests <em>say</em></h2>
                </div>
                <div className="home-reviews__grid home-car">
                  {reviews.slice(0, 6).map((r) => (
                    <article className="home-card home-review home-reveal" key={r.id}>
                      <div className="home-review__stars" aria-label={`${r.rating} out of 5`}>{'★'.repeat(r.rating)}</div>
                      {r.comment && <p>&ldquo;{r.comment}&rdquo;</p>}
                      <div className="home-review__foot">
                        <div className="home-review__by">
                          <b>{r.customer_name}</b>
                          {r.stylist_name && <span>with {r.stylist_name}</span>}
                        </div>
                        <span className="home-review__date">{reviewDate.format(new Date(r.created_at))}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── faq ── */}
          <section className="home-section" id="faq">
            <div className="home-wrap">
              <div className="home-head home-reveal">
                <span className="home-eyebrow home-eyebrow--center">Good to know</span>
                <h2 className="home-h">Frequently asked <em>questions</em></h2>
              </div>
              <div className="home-reveal">
                <Faq items={FAQS} />
              </div>
            </div>
          </section>

          {/* ── visit ── */}
          <section className="home-section home-visit" id="visit">
            <div className="home-wrap">
              <div className="home-visit__grid">
                <div className="home-reveal">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                      <span className="home-eyebrow">Find us</span>
                      <h2 className="home-h">Location &amp; <em>hours</em></h2>
                    </div>
                    <LiveStatus hours={hours} />
                  </div>

                  <ul className="home-hours home-card" style={{ padding: '8px 22px', marginTop: 22 }}>
                    {DAYS.map(({ dow, label }) => {
                      const h = hoursByDow.get(dow);
                      const closed = !h || h.is_closed;
                      return (
                        <li key={dow}>
                          <span className="day">{label}</span>
                          <span className={closed ? 'closed' : 'time'}>
                            {closed ? 'Closed' : `${minutesToLabel(h!.open_minute)} – ${minutesToLabel(h!.close_minute)}`}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="home-info">
                    <div className="home-card home-info__card">
                      <div className="k">Address</div>
                      <div className="v">{contact.address}</div>
                    </div>
                    <div className="home-card home-info__card">
                      <div className="k">Plus code</div>
                      <div className="v">{contact.plusCode}</div>
                    </div>
                    <div className="home-card home-info__card">
                      <div className="k">Call / WhatsApp</div>
                      <div className="v">{contact.phonePrimary}</div>
                    </div>
                    <div className="home-card home-info__card">
                      <div className="k">Also</div>
                      <div className="v">{contact.phoneOther}</div>
                    </div>
                  </div>

                  <div className="home-visit__actions">
                    <BookButton variant="primary">Book a visit</BookButton>
                    <a href={contact.facebookUrl} target="_blank" rel="noopener" className="home-btn home-btn--ghost">Facebook</a>
                  </div>
                </div>

                <div className="home-visit__map home-reveal">
                  <ImgSlot src="/images/visit/map.png" alt={`Map showing ${contact.address}`} />
                </div>
              </div>
            </div>
          </section>

          {/* ── CTA ── */}
          <section className="home-section home-cta">
            <span className="home-cta__glow" aria-hidden="true" />
            <div className="home-wrap home-cta__inner home-reveal">
              <h2>{cta.title}</h2>
              <p>{cta.sub}</p>
              <div className="home-cta__actions">
                <BookButton variant="light">Book a visit</BookButton>
                <a href={cta.phoneHref} className="home-btn home-btn--light">{cta.phoneLabel}</a>
              </div>
            </div>
          </section>
        </main>

        {/* ── footer ── */}
        <footer className="home-foot">
          <div className="home-wrap">
            <div className="home-foot__grid">
              <div className="home-foot__brand">
                <a className="home-brand" href="#top" aria-label="Vero Salon home">
                  <span className="home-brand__mark" aria-hidden="true">V</span>
                  <span className="home-brand__name">
                    <b>Vero Salon</b>
                    <small>Unisex · Pasyala</small>
                  </span>
                </a>
                <p>{contact.footerBlurb}</p>
              </div>
              <div>
                <h5>Salon</h5>
                <ul>
                  {NAV_LINKS.map((l) => <li key={l.href}><a href={l.href}>{l.label}</a></li>)}
                </ul>
              </div>
              <div>
                <h5>Hours</h5>
                <ul>
                  <li>Open daily</li>
                  <li>10:00 AM – 12:00 AM</li>
                  <li style={{ color: 'var(--accent-text)' }}>Walk-ins welcome</li>
                </ul>
              </div>
              <div>
                <h5>Contact</h5>
                <ul>
                  <li><a href={`tel:${contact.phonePrimary.replace(/\s/g, '')}`}>{contact.phonePrimary}</a></li>
                  <li><a href={contact.facebookUrl} target="_blank" rel="noopener">Facebook</a></li>
                  <li>{contact.address}</li>
                </ul>
              </div>
            </div>
            <div className="home-foot__bottom">
              <span>© 2026 Vero Salon Unisex. All rights reserved.</span>
              <span className="home-foot__legal">
                <a href="/privacy">Privacy</a>
                <a href="/terms">Terms</a>
              </span>
            </div>
          </div>
        </footer>

        <BottomNav
          signedIn={!!profile}
          accountHref={accountHref}
          accountLabel={accountLabel}
          avatarSrc={accountAvatar}
        />
      </div>
    </BookingProvider>
  );
}
