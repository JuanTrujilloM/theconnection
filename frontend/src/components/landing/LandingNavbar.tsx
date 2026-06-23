'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/Button';

// Sticky top navbar. Gains a frosted navy background once the user scrolls past
// the hero fold so the wordmark stays legible over any section.
export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-navy-deep/80 border-white/10 backdrop-blur-md'
          : 'border-transparent'
      } border-b`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/login"
            className="text-slate hover:text-cream px-2 text-sm font-medium transition-colors"
          >
            Iniciar sesión
          </Link>
          {/* CTA routes to the existing registration flow. */}
          <Link href="/register">
            <Button className="px-5 py-2">Únete ahora</Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
