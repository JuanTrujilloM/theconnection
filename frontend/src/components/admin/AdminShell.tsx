'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/shared/Logo';
import { LogoutButton } from '@/components/shared/LogoutButton';
import type { AuthUser } from '@/types/auth';

// Desktop admin chrome: a fixed sidebar for navigation and a top bar showing the
// current section and the signed-in admin. Renders full-width (not the mobile
// PhoneShell the student app uses) because admin is a PC-format tool.

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const NAV: NavItem[] = [
  { href: '/admin', label: 'Resumen', icon: '▚' },
  { href: '/admin/matches', label: 'Matches', icon: '♥' },
  { href: '/admin/usuarios', label: 'Usuarios', icon: '☺' },
  { href: '/admin/venues', label: 'Lugares', icon: '⌖' },
  { href: '/admin/feedback', label: 'Feedback', icon: '✎' },
  { href: '/admin/reportes', label: 'Reportes', icon: '⚑' },
];

function isActive(pathname: string, href: string): boolean {
  // Exact match for the root so it isn't highlighted on every subpage.
  return href === '/admin' ? pathname === href : pathname.startsWith(href);
}

export function AdminShell({
  user,
  children,
}: {
  user: AuthUser;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const current = NAV.find((item) => isActive(pathname, item.href));

  return (
    <div className="flex min-h-screen w-full">
      <aside className="border-white/10 bg-navy-soft/80 sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r px-4 py-6">
        <div className="px-2">
          <Logo />
          <p className="text-slate mt-1 text-xs font-medium tracking-wide uppercase">
            Panel de administración
          </p>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? 'bg-cyan/15 text-cyan'
                    : 'text-slate hover:bg-white/5 hover:text-cream'
                }`}
              >
                <span aria-hidden className="w-4 text-center">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/dashboard"
          className="text-slate hover:text-cream mt-2 px-3 py-2 text-xs transition"
        >
          ← Volver a la app
        </Link>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-white/10 bg-navy-deep/80 sticky top-0 z-10 flex items-center justify-between gap-4 border-b px-8 py-4 backdrop-blur">
          <h2 className="text-cream text-lg font-semibold">
            {current?.label ?? 'Panel'}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-slate hidden text-sm sm:inline">
              {user.email}
            </span>
            <LogoutButton />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
