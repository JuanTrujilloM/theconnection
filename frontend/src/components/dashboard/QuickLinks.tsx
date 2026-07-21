'use client';

import Link from 'next/link';

interface QuickLink {
  href: string;
  emoji: string;
  label: string;
}

export function QuickLinks({ isAdmin }: { isAdmin: boolean }) {
  const links: QuickLink[] = [
    { href: '/perfil', emoji: '👤', label: 'Perfil' },
    { href: '/intereses', emoji: '✨', label: 'Intereses' },
  ];
  if (isAdmin) {
    links.push({ href: '/admin/venues', emoji: '🏪', label: 'Lugares' });
  }

  return (
    <div className="mt-3 grid grid-cols-2 gap-2.5">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="border-white/10 text-cream flex items-center gap-2.5 rounded-2xl border bg-white/[0.03] p-3.5 text-sm font-semibold transition hover:bg-white/[0.05]"
        >
          <span className="text-lg">{link.emoji}</span>
          {link.label}
        </Link>
      ))}
    </div>
  );
}
