import Link from 'next/link';

// Brand wordmark. Warm "Atardecer" heart (coral→flame), "The" in cream and
// "Connection" in cyan — the blue identity anchor stays.
export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2 text-lg font-bold tracking-tight ${className}`}
    >
      <span
        className="from-coral to-flame bg-gradient-to-r bg-clip-text text-transparent"
        aria-hidden
      >
        ♥
      </span>
      <span>
        <span className="text-cream">The</span>
        <span className="from-cyan to-flame bg-gradient-to-r bg-clip-text text-transparent">
          Connection
        </span>
      </span>
    </Link>
  );
}
