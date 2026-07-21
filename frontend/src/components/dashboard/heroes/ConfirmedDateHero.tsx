'use client';

import { useMemo } from 'react';
import { Countdown } from '@/components/dashboard/Countdown';
import type { CurrentMatch, MatchDate } from '@/types/match';

// Dates are stored as UTC instants; render them in Colombia time so the day and
// hour match what the student expects.
const DAY_FORMAT = new Intl.DateTimeFormat('es-CO', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  timeZone: 'America/Bogota',
});
const TIME_FORMAT = new Intl.DateTimeFormat('es-CO', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: 'America/Bogota',
});

function formatWhen(scheduledAt: string): string {
  const date = new Date(scheduledAt);
  return `${DAY_FORMAT.format(date)} · ${TIME_FORMAT.format(date)}`;
}

export function ConfirmedDateHero({
  match,
  date,
}: {
  match: CurrentMatch;
  date: MatchDate;
}) {
  const target = useMemo(
    () => new Date(date.scheduledAt),
    [date.scheduledAt],
  );
  const partnerName = match.partner?.name ?? 'tu match';

  const rows: { icon: string; label: string; value: string }[] = [
    { icon: '📍', label: 'Lugar', value: date.venueName },
    { icon: '🗺️', label: 'Dirección', value: date.address },
    { icon: '🗓️', label: 'Cuándo', value: formatWhen(date.scheduledAt) },
  ];

  return (
    <section className="border-gold/25 relative overflow-hidden rounded-3xl border bg-gradient-to-br from-gold/[0.14] to-navy-soft/50 p-6">
      <span className="border-gold/35 bg-gold/[0.14] text-gold inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold">
        ✓ Cita confirmada
      </span>
      <h1 className="text-cream mt-3.5 text-xl font-bold">
        Tu cita con {partnerName}
      </h1>

      <Countdown target={target} />

      <div className="mt-4">
        {rows.map((row) => (
          <div
            key={row.label}
            className="border-white/10 flex items-center gap-3 border-t py-2.5 first:border-t-0 first:pt-0 text-sm"
          >
            <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-white/[0.05] text-sm">
              {row.icon}
            </span>
            <div className="min-w-0">
              <p className="text-slate text-[10px] tracking-wider uppercase">
                {row.label}
              </p>
              <p className="text-cream truncate font-semibold">{row.value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
