import { ThemeToggle } from '@/components/theme/theme-toggle';
import { NavAuth } from '@/components/site/nav-auth';
import { getProfile } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';

export async function Nav() {
  const profile = await getProfile();
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  const userMetadata = user?.user_metadata ?? null;
  return (
    <header className="nav" id="nav">
      <div className="wrap nav__inner">
        <a className="brand" href="#top" aria-label="Vero Salon home">
          <span className="brand__mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>
          </span>
          <span className="brand__name">VERO<span aria-hidden="true" style={{ color: 'var(--accent)' }}>✦</span><small>SALON · UNISEX</small></span>
        </a>
        <nav className="nav__links">
          <a href="#services">Services</a>
          <a href="#destinations">Our Work</a>
          <a href="#how">Your Visit</a>
          <a href="#team">Stylists</a>
          <a href="#visit">Find Us</a>
        </nav>
        <ThemeToggle />
        <NavAuth profile={profile} userMetadata={userMetadata} />
        {/* "Book now" is for customers — staff/admin manage bookings elsewhere */}
        {profile?.role !== 'admin' && profile?.role !== 'staff' && (
          <a href="#book" className="btn btn--primary nav__cta nav__cta--book">Book now</a>
        )}
      </div>
    </header>
  );
}
