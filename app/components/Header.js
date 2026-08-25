'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/', label: 'Screen' },
  { href: '/about', label: 'About' },
];

const TOOLS = [
  { href: 'https://dc-lease.vercel.app', label: 'Lease Comparator' },
  { href: 'https://dc-risk.vercel.app', label: 'Risk Register' },
];

export default function Header() {
  const path = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-baseline gap-3">
          <Link href="/" className="text-[15px] font-semibold tracking-tight text-[var(--ink)]">
            DC Site Screener
          </Link>
          <span className="eyebrow">Site intelligence</span>
        </div>

        <nav className="flex items-center gap-2">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`btn btn-sm ${path === n.href ? 'btn-soft' : 'btn-ghost'}`}
            >
              {n.label}
            </Link>
          ))}
          <span className="mx-1 h-5 w-px bg-[var(--border-strong)]" />
          {TOOLS.map((t) => (
            <a key={t.href} href={t.href} target="_blank" rel="noreferrer" className="btn btn-sm btn-ghost">
              {t.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}