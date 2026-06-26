'use client';

import { useInView } from '@/hooks/useInView';
import { useCountUp } from '@/hooks/useCountUp';

const STATS = [
  { value: 500, suffix: '+', label: 'Citas coordinadas' },
  { value: 85, suffix: '%', label: 'Van a una segunda cita' },
  { value: 8, suffix: '', label: 'Universidades verificadas' },
];

// A single stat whose number counts up when the row scrolls into view.
function Counter({
  value,
  suffix,
  label,
  active,
}: {
  value: number;
  suffix: string;
  label: string;
  active: boolean;
}) {
  const current = useCountUp(value, active);
  return (
    <div className="text-center">
      <p className="from-cyan to-blush bg-gradient-to-r bg-clip-text text-5xl font-extrabold text-transparent sm:text-6xl">
        {current}
        {suffix}
      </p>
      <p className="text-slate mt-2 text-sm">{label}</p>
    </div>
  );
}

// Social proof band: a tinted gradient card with a colored glow and counters
// that animate once, on first view.
export function SocialProofSection() {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20">
      <div
        ref={ref}
        className="from-cyan/10 via-navy-soft to-blush/10 relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r px-6 py-12 shadow-[0_30px_80px_-40px_rgba(0,229,255,0.35)]"
      >
        {/* Decorative corner glows. */}
        <div className="bg-cyan/20 absolute -top-16 -left-16 h-48 w-48 rounded-full blur-3xl" />
        <div className="bg-blush/20 absolute -right-16 -bottom-16 h-48 w-48 rounded-full blur-3xl" />

        <div className="relative grid gap-10 sm:grid-cols-3 sm:gap-6">
          {STATS.map((stat, index) => (
            <div
              key={stat.label}
              className={
                index > 0 ? 'sm:border-l sm:border-white/10 sm:pl-6' : ''
              }
            >
              <Counter active={inView} {...stat} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
