'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, type IconName } from '@/components/ui/icon';

export function NavLinks({ items }: { items: { href: string; label: string; icon: IconName }[] }) {
  const path = usePathname();
  return (
    <nav className="side__nav">
      {items.map((n) => {
        const active = n.href === '/admin' ? path === '/admin' : path.startsWith(n.href);
        return (
          <Link key={n.href} href={n.href} className={active ? 'on' : undefined}>
            <Icon name={n.icon} className="ic" /> {n.label}
          </Link>
        );
      })}
    </nav>
  );
}
