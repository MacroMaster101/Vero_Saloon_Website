import Link from 'next/link';
import { requireRole } from '@/lib/supabase/auth';
import { getSiteContent } from '@/lib/content/get';
import { getBusinessHours } from '@/lib/queries';
import { QuoteForm, CtaForm, StoryForm, HeroForm, StatsForm, ContactForm, HoursForm } from './content-forms';

export default async function ContentPage() {
  await requireRole(['admin'], '/admin/content');
  const [quote, cta, story, hero, stats, contact, hours] = await Promise.all([
    getSiteContent('quote'),
    getSiteContent('cta'),
    getSiteContent('story'),
    getSiteContent('hero'),
    getSiteContent('stats'),
    getSiteContent('contact'),
    getBusinessHours(),
  ]);
  return (
    <div className="apage">
      <div className="ahead">
        <div>
          <span className="eyebrow">Homepage</span>
          <h1 className="ahead__title">Content</h1>
        </div>
        <Link href="/" target="_blank" className="btn btn--ghost">View on site ↗</Link>
      </div>
      <div className="acontent-grid">
        <HeroForm content={hero} />
        <StatsForm content={stats} />
        <StoryForm content={story} />
        <QuoteForm content={quote} />
        <CtaForm content={cta} />
        <HoursForm hours={hours} />
        <ContactForm content={contact} />
      </div>
    </div>
  );
}
