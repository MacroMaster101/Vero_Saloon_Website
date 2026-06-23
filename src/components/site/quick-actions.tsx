const ACTIONS: { href: string; label: string; icon: React.ReactNode }[] = [
  { href: '#book', label: 'Book', icon: (
    <svg className="ic-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="5" width="16" height="16" rx="2"/><line x1="4" y1="9" x2="20" y2="9"/><line x1="9" y1="3" x2="9" y2="6"/><line x1="15" y1="3" x2="15" y2="6"/></svg>
  ) },
  { href: '#services', label: 'Services', icon: (
    <svg className="ic-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>
  ) },
  { href: '#visit', label: 'Find us', icon: (
    <svg className="ic-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21s7-6.5 7-11a7 7 0 1 0-14 0c0 4.5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg>
  ) },
];

export function QuickActions() {
  return (
    <div className="qa">
      {ACTIONS.map((a) => (
        <a key={a.href} className="qa__pill" href={a.href}>
          <span className="qa__ic">{a.icon}</span>
          <span className="qa__label">{a.label}</span>
        </a>
      ))}
    </div>
  );
}
