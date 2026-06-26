import Link from 'next/link';

// Brand wordmark. "The" in cream, "Connection" in cyan, with a heart glyph.
export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2 text-lg font-bold tracking-tight ${className}`}
    >
      <span className="text-cyan" aria-hidden>
        ♥
      </span>
      <span>
        <span className="text-cream">The</span>
        <span className="text-cyan">Connection</span>
      </span>
    </Link>
  );
}
