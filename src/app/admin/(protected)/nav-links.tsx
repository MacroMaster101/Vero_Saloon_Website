'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, type IconName } from '@/components/ui/icon';

export function NavLinks({ items, root = '/admin' }: { items: { href: string; label: string; icon: IconName }[]; root?: string }) {
  const path = usePathname();
  return (
    <nav className="side__nav">
      {items.map((n) => {
        // the section root only matches exactly, so it doesn't stay lit on subpages
        const active = n.href === root ? path === root : path.startsWith(n.href);
        return (
          <Link key={n.href} href={n.href} className={active ? 'on' : undefined}>
            <Icon name={n.icon} className="ic" /> {n.label}
          </Link>
        );
      })}
    </nav>
  );
}
