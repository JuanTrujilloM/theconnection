'use client';

import { useMemo } from 'react';
import { Countdown } from '@/components/dashboard/Countdown';
import { nextMatchDrop } from '@/lib/nextMatchDrop';

// Default state: no active match. The countdown to the Sunday 7pm drop is the
// anchor that makes the weekly cadence feel alive.
export function SearchingHero() {
  const target = useMemo(() => nextMatchDrop(), []);

  return (
    <section className="border-cyan/20 relative overflow-hidden rounded-3xl border bg-gradient-to-br from-cyan/[0.08] to-navy-soft/50 p-6">
      <span className="border-cyan/30 bg-cyan/10 text-cyan inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold">
        ● Buscando cita
      </span>
      <h1 className="text-cream mt-3.5 text-xl leading-tight font-bold">
        Tu próximo match llega el domingo
      </h1>
      <p className="text-slate mt-1.5 text-sm">
        Cada domingo a las 7:00 pm generamos una sola persona para ti.
      </p>
      <Countdown target={target} />
    </section>
  );
}
