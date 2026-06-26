import Link from 'next/link';
import { Logo } from '@/components/shared/Logo';

const LEGAL_LINKS = [
  { label: 'Términos', href: '#' },
  { label: 'Privacidad', href: '#' },
  { label: 'Habeas Data', href: '#' },
];

// Site footer: wordmark, legal links and Instagram.
export function LandingFooter() {
  return (
    <footer className="border-white/10 border-t px-4 py-12 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="space-y-2 text-center sm:text-left">
          <Logo />
          <p className="text-slate text-xs">
            Citas curadas para universitarios en Colombia.
          </p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-5 text-sm">
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-slate hover:text-cream transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate hover:text-cyan transition-colors"
          >
            Instagram ↗
          </a>
        </nav>
      </div>

      <p className="text-slate/60 mx-auto mt-8 max-w-6xl text-center text-xs sm:text-left">
        © {new Date().getFullYear()} TheConnection. Todos los derechos reservados.
      </p>
    </footer>
  );
}
