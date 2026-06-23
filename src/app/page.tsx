import { Nav } from '@/components/site/nav';
import { ScrollProgress } from '@/components/site/scroll-progress';
import { LenisProvider } from '@/components/site/lenis-provider';
import { RevealObserver } from '@/components/site/reveal-observer';
import { Hero } from '@/components/site/hero';
import { Marquee } from '@/components/site/marquee';
import { Stats } from '@/components/site/stats';
import { Services } from '@/components/site/services';
import { Lookbook } from '@/components/site/lookbook';
import { HowItWorks } from '@/components/site/how-it-works';
import { Stylists } from '@/components/site/stylists';
import { Story } from '@/components/site/story';
import { Quote } from '@/components/site/quote';
import { Visit } from '@/components/site/visit';
import { Cta } from '@/components/site/cta';
import { Footer } from '@/components/site/footer';
import { BottomNav } from '@/components/site/bottom-nav';
import { MobileHome } from '@/components/site/mobile-home';
import { ReviewsSection } from '@/components/site/reviews-section';
import { BookingWizard } from '@/components/booking/booking-wizard';
import { LoadingScreen } from '@/components/site/loading-screen';
import { getGallery, getBookableServices, getStylists, getRecentReviews } from '@/lib/queries';
import { getSiteContent } from '@/lib/content/get';

export default async function Home({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const sp = await searchParams;
  const deleted = sp.deleted === '1';
  const [gallery, services, stylists, quote, cta, story, hero, stats, contact, recentReviews] = await Promise.all([
    getGallery(),
    getBookableServices(),
    getStylists(),
    getSiteContent('quote'),
    getSiteContent('cta'),
    getSiteContent('story'),
    getSiteContent('hero'),
    getSiteContent('stats'),
    getSiteContent('contact'),
    getRecentReviews(),
  ]);
  return (
    <>
      {deleted && (
        <div role="status" style={{ background: 'var(--accent-tint)', color: 'var(--fg)', textAlign: 'center', padding: '12px 16px', fontSize: 14 }}>
          Your account and personal data have been deleted. Thank you for visiting Vero Salon.
        </div>
      )}
      <LoadingScreen />
      <ScrollProgress />
      <LenisProvider />
      <RevealObserver />
      <Nav />
      <main id="top">
        <MobileHome services={services} stylists={stylists} />
        <div className="is-desktop-only"><Hero content={hero} /></div>
        <Marquee />
        <div className="is-desktop-only"><Stats content={stats} /></div>
        <div className="is-desktop-only"><Services /></div>
        <Lookbook items={gallery} />
        <HowItWorks />
        <section className="section booking" id="book">
          <div className="wrap">
            <div className="sec-head reveal in" style={{ marginBottom: 34 }}>
              <div>
                <span className="eyebrow">Book now</span>
                <h2 className="h-section">Reserve your visit</h2>
              </div>
              <p className="lead">
                Four quick steps. No account, no deposit — just pick a service, a stylist, and a time.
              </p>
            </div>
            <BookingWizard services={services} stylists={stylists} />
          </div>
        </section>
        <div className="is-desktop-only"><Stylists /></div>
        <Story content={story} />
        <Quote content={quote} />
        <ReviewsSection reviews={recentReviews} />
        <Visit content={contact} />
        <Cta content={cta} />
      </main>
      <Footer content={contact} />
      <BottomNav />
    </>
  );
}
