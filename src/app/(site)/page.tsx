import { cookies } from 'next/headers';
import { t } from '@/lib/i18n/translations';
import { LocaleProvider } from '@/lib/i18n/locale-context';
import { LangToggle } from '@/components/theme/lang-toggle';
import { BookingProvider } from '@/components/booking/booking-provider';
import { AccountModalsProvider } from '@/components/account/account-modals';
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
import { LogoIcon } from '@/components/ui/logo-icon';
import {
  getBookableServices,
  getGallery,
  getStylists,
  getRecentReviews,
  getBusinessHours,
} from '@/lib/queries';

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

// timeZone pinned like every other formatter in the app — without it this ran in
// the host zone (UTC on Vercel), so a review left before 05:30 Colombo time
// displayed with the previous day's date.
const reviewDate = new Intl.DateTimeFormat('en-LK', { timeZone: 'Asia/Colombo', day: 'numeric', month: 'short', year: 'numeric' });


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

  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'en';

  const translatedNavLinks = NAV_LINKS.map(l => ({ ...l, label: t(l.label, locale) }));
  const translatedStrip = STRIP.map(s => t(s, locale));
  const translatedSteps = STEPS.map(s => ({ h: t(s.h, locale), p: t(s.p, locale) }));
  const translatedFaqs = FAQS.map(f => ({ q: t(f.q, locale), a: t(f.a, locale) }));
  const translatedDays = DAYS.map(d => ({ ...d, label: t(d.label, locale) }));

  if (locale === 'si') {
    hero.eyebrow = t(hero.eyebrow, locale);
    hero.line1 = t(hero.line1, locale);
    hero.line2Em = t(hero.line2Em, locale);
    hero.line3 = t(hero.line3, locale);
    hero.lead = t(hero.lead, locale);

    story.eyebrow = t(story.eyebrow, locale);
    story.heading = t(story.heading, locale);
    story.paragraphs = story.paragraphs.map((p) => t(p, locale));
    story.sign = t(story.sign, locale);

    stats.cards = stats.cards.map((c) => ({ ...c, label: t(c.label, locale), value: t(c.value, locale) }));

    cta.title = t(cta.title, locale);
    cta.sub = t(cta.sub, locale);
    cta.phoneLabel = t(cta.phoneLabel, locale);

    contact.address = t(contact.address, locale);
    contact.plusCode = t(contact.plusCode, locale);
    contact.footerBlurb = t(contact.footerBlurb, locale);
  }

  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  const userMetadata = user?.user_metadata ?? null;
  // Has a password when either: an "email" identity exists (native email
  // signup / invited staff), OR the has_password flag was stamped when a
  // Google user set one (setting a password on an OAuth account doesn't add
  // an email identity, so the flag is the only client-readable signal).
  const hasPassword =
    (user?.identities ?? []).some((i) => i.provider === 'email') ||
    user?.user_metadata?.has_password === true;

  const looks = gallery.slice(0, 5);
  const isCustomer = profile?.role !== 'admin' && profile?.role !== 'staff' && profile?.role !== 'owner';
  const hoursByDow = new Map(hours.map((h) => [h.day_of_week, h]));

  // Account tab for the mobile bottom bar — mirror NavAuth's routing/avatar.
  // Signed-in customers get null: their tab opens the account popup menu.
  const accountHref = !profile
    ? '/login'
    : profile.role === 'admin'
      ? '/admin'
      : profile.role === 'owner'
        ? '/owner'
        : profile.role === 'staff'
          ? '/staff' // /admin/schedule is admin-only; staff's surface is /staff
          : null;
  const accountLabel = profile?.role === 'staff' ? t('Schedule', locale) : profile?.role === 'admin' ? t('Admin', locale) : profile?.role === 'owner' ? t('My shop', locale) : t('Account', locale);
  const accountAvatar = profile ? avatarSrc(userMetadata, profile.email ?? profile.fullName ?? 'guest') : null;

  return (
    <LocaleProvider locale={locale}>
    <BookingProvider
      services={services}
      stylists={stylists}
      enabled={isCustomer}
      prefill={profile ? { name: profile.fullName ?? '', phone: profile.phone ?? '', email: profile.email ?? '' } : null}
      locale={locale}
    >
      <AccountModalsProvider profile={profile} userMetadata={userMetadata} hasPassword={hasPassword} locale={locale}>
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
              <span className="home-brand__mark" aria-hidden="true"><LogoIcon /></span>
              <span className="home-brand__name">
                <b>Vero Salon</b>
                <small>{t('Unisex', locale)} · {t('Pasyala', locale)}</small>
              </span>
            </a>

            <nav className="home-nav" aria-label="Primary">
              {translatedNavLinks.map((l) => (
                <a key={l.href} href={l.href}>{l.label}</a>
              ))}
            </nav>

            <div className="home-header__actions">
              <LangToggle currentLocale={locale} className="home-header__lang" />
              <ThemeToggle />
              <NavAuth profile={profile} userMetadata={userMetadata} locale={locale} />
              <BookButton variant="primary" className="home-header__book">{t('Book now', locale)}</BookButton>
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
                  <BookButton variant="primary">{t('Book a visit', locale)}</BookButton>
                  <a className="home-link" href="#services">{t('See our services', locale)} <span aria-hidden="true">→</span></a>
                </div>
                <dl className="home-hero__facts">
                  <div>
                    <dt>{t('Google rating', locale)}</dt>
                    <dd>4.9 ★ · 120+</dd>
                  </div>
                  <div>
                    <dt>{t('Open daily', locale)}</dt>
                    <dd>{locale === 'si' ? 'පෙ.ව. 10 - මධ්‍යම රාත්‍රී 12' : '10 AM – 12 AM'}</dd>
                  </div>
                  <div>
                    <dt>{t('For', locale)}</dt>
                    <dd>{t('Him & her', locale)}</dd>
                  </div>
                </dl>
              </div>

              <div className="home-hero__media home-reveal">
                <span className="home-hero__pole" aria-hidden="true" />
                <div className="home-hero__frame">
                  <ImgSlot src="/images/story/interior.png" alt="Vero Salon interior" priority={true} sizes="(max-width: 980px) 100vw, 50vw" />
                </div>
                <div className="home-hero__badge">
                  <span className="home-dot" aria-hidden="true" />
                  <span>
                    <b>{t('Open until midnight', locale)}</b>
                    <span style={{ display: 'block' }}>{t('Walk-ins welcome', locale)}</span>
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ── trust strip ── */}
          <div className="home-strip" aria-hidden="true">
            <div className="home-strip__track">
              <span>{translatedStrip.map((s) => <span key={s}>{s}</span>)}</span>
              <span>{translatedStrip.map((s) => <span key={`b-${s}`}>{s}</span>)}</span>
            </div>
          </div>

          {/* ── story / about ── */}
          <section className="home-section home-story" id="about">
            <div className="home-wrap home-story__grid">
              <div className="home-story__art home-reveal">
                {/* Same asset as the hero image (already preloaded), so eager-load it too —
    a lazy second instance trips Next's LCP warning when it paints first. */}
                <ImgSlot src="/images/story/interior.png" alt="Inside Vero Salon" priority={true} sizes="(max-width: 980px) 100vw, 50vw" />
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
                <span className="home-eyebrow home-eyebrow--center">{t('What we offer', locale)}</span>
                <h2 className="home-h">{t('Services', locale)} &amp; <em>{t('pricing', locale)}</em></h2>
                <p className="home-lead">{t('Hair, colour and beauty for him & her. Prices in LKR — final quote confirmed at your consultation.', locale)}</p>
              </div>
              <div className="home-reveal">
                <ServicesTabs services={services} locale={locale} />
              </div>
            </div>
          </section>

          {/* ── how it works ── */}
          <section className="home-section home-how" id="how">
            <div className="home-wrap">
              <div className="home-head home-reveal">
                <span className="home-eyebrow home-eyebrow--center">{t('How it works', locale)}</span>
                <h2 className="home-h">{t('Your visit, step by step', locale)}</h2>
                <p className="home-lead">{t('From booking to the final mirror check — here is exactly what to expect.', locale)}</p>
                <span className="home-swipe" aria-hidden="true">{t('swipe', locale)}</span>
              </div>
              <div className="home-steps home-car">
                {translatedSteps.map((s) => (
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
            <section className="home-section" id="looks" style={{ background: 'transparent' }}>
              <div className="home-wrap">
                <div className="home-head home-reveal">
                  <span className="home-eyebrow home-eyebrow--center">{t('Our work', locale)}</span>
                  <h2 className="home-h">{t('The lookbook', locale)}</h2>
                  <p className="home-lead">{t('A glimpse of the cuts, colour and care that walk out our door.', locale)}</p>
                  <span className="home-swipe" aria-hidden="true">{t('swipe', locale)}</span>
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
                  <span className="home-eyebrow home-eyebrow--center">{t('The artisans', locale)}</span>
                  <h2 className="home-h">{t('Meet our stylists', locale)}</h2>
                  <p className="home-lead">{t('A friendly, trained team dedicated to hair craft, colour and beauty care.', locale)}</p>
                  <span className="home-swipe" aria-hidden="true">{t('swipe', locale)}</span>
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
            <section className="home-section" id="reviews" style={{ background: 'transparent' }}>
              <div className="home-wrap">
                <div className="home-head home-reveal">
                  <span className="home-eyebrow home-eyebrow--center">{t('Client voices', locale)}</span>
                  <h2 className="home-h">{t('What guests say', locale)}</h2>
                  <span className="home-swipe" aria-hidden="true">{t('swipe', locale)}</span>
                </div>
                <div className="home-reviews__grid home-car">
                  {reviews.slice(0, 6).map((r) => (
                    <article className="home-card home-review home-reveal" key={r.id}>
                      <div className="home-review__stars" aria-label={`${r.rating} out of 5`}>{'★'.repeat(r.rating)}</div>
                      {r.comment && <p>&ldquo;{r.comment}&rdquo;</p>}
                      <div className="home-review__foot">
                        <div className="home-review__by">
                          <b>{r.customer_name}</b>
                          {r.stylist_name && <span>{t('with', locale)} {r.stylist_name}</span>}
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
                <span className="home-eyebrow home-eyebrow--center">{t('Good to know', locale)}</span>
                <h2 className="home-h">{t('Frequently asked questions', locale)}</h2>
              </div>
              <div className="home-reveal">
                <Faq items={translatedFaqs} />
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
                      <span className="home-eyebrow">{t('Find us', locale)}</span>
                      <h2 className="home-h">{t('Location & hours', locale)}</h2>
                    </div>
                    <LiveStatus hours={hours} locale={locale} />
                  </div>

                  <ul className="home-hours home-card" style={{ padding: '8px 22px', marginTop: 22 }}>
                    {translatedDays.map(({ dow, label }) => {
                      const h = hoursByDow.get(dow);
                      const closed = !h || h.is_closed;
                      return (
                        <li key={dow}>
                          <span className="day">{label}</span>
                          <span className={closed ? 'closed' : 'time'}>
                            {closed ? t('Closed', locale) : `${minutesToLabel(h!.open_minute, locale)} – ${minutesToLabel(h!.close_minute, locale)}`}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="home-info">
                    <div className="home-card home-info__card">
                      <div className="k">{t('Address', locale)}</div>
                      <div className="v">{contact.address}</div>
                    </div>
                    <div className="home-card home-info__card">
                      <div className="k">{t('Plus code', locale)}</div>
                      <div className="v">{contact.plusCode}</div>
                    </div>
                    <div className="home-card home-info__card">
                      <div className="k">{t('Call / WhatsApp', locale)}</div>
                      <div className="v">{contact.phonePrimary}</div>
                    </div>
                    <div className="home-card home-info__card">
                      <div className="k">{t('Also', locale)}</div>
                      <div className="v">{contact.phoneOther}</div>
                    </div>
                  </div>

                  <div className="home-visit__actions">
                    <BookButton variant="primary">{t('Book a visit', locale)}</BookButton>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(contact.plusCode || contact.address)}`}
                      target="_blank" rel="noopener" className="home-btn home-btn--ghost"
                    >
                      {t('Get directions', locale)}
                    </a>
                    <a href={contact.facebookUrl} target="_blank" rel="noopener" className="home-btn home-btn--ghost">{t('Facebook', locale)}</a>
                  </div>
                </div>

                <div className="home-visit__map home-reveal">
                  {/* Official Google Maps place embed (admin-editable); if blanked,
                      falls back to a keyless plus-code search embed. */}
                  <iframe
                    src={contact.mapEmbedUrl || `https://www.google.com/maps?q=${encodeURIComponent(contact.plusCode || contact.address)}&z=16&output=embed`}
                    title={`${t('Map showing', locale)} ${contact.address}`}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                  />
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
                <BookButton variant="primary">{t('Book a visit', locale)}</BookButton>
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
                  <span className="home-brand__mark" aria-hidden="true"><LogoIcon /></span>
                  <span className="home-brand__name">
                    <b>Vero Salon</b>
                    <small>{t('Unisex', locale)} · {t('Pasyala', locale)}</small>
                  </span>
                </a>
                <p>{contact.footerBlurb}</p>
              </div>
              <div>
                <h5>{t('Salon', locale)}</h5>
                <ul>
                  {translatedNavLinks.map((l) => <li key={l.href}><a href={l.href}>{l.label}</a></li>)}
                </ul>
              </div>
              <div>
                <h5>{t('Hours', locale)}</h5>
                <ul>
                  <li>{t('Open daily', locale)}</li>
                  <li>10:00 AM – 12:00 AM</li>
                  <li style={{ color: 'var(--accent-text)' }}>{t('Walk-ins welcome', locale)}</li>
                </ul>
              </div>
              <div>
                <h5>{t('Contact', locale)}</h5>
                <ul>
                  <li><a href={`tel:${contact.phonePrimary.replace(/\s/g, '')}`}>{contact.phonePrimary}</a></li>
                  <li><a href={contact.facebookUrl} target="_blank" rel="noopener">{t('Facebook', locale)}</a></li>
                  <li>{contact.address}</li>
                </ul>
              </div>
            </div>
            <div className="home-foot__bottom">
              <span>© 2026 Vero Salon Unisex. {t('All rights reserved.', locale)}</span>
              <span className="home-foot__legal">
                <a href="/privacy">{t('Privacy', locale)}</a>
                <a href="/terms">{t('Terms', locale)}</a>
              </span>
            </div>
          </div>
        </footer>

        <BottomNav
          signedIn={!!profile}
          accountHref={accountHref}
          accountLabel={accountLabel}
          avatarSrc={accountAvatar}
          locale={locale}
        />
      </div>
      </AccountModalsProvider>
    </BookingProvider>
    </LocaleProvider>
  );
}
