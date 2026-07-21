'use client';

import { useDashboardStats } from '@/hooks/useDashboardStats';

const ACCENTS = ['text-cyan', 'text-gold', 'text-flame'] as const;

export function StatsRow() {
  const { data, isLoading } = useDashboardStats();

  const cells: { value: number; label: string }[] = [
    { value: data?.totalMatches ?? 0, label: 'matches' },
    { value: data?.totalDates ?? 0, label: 'citas' },
    { value: data?.weeksActive ?? 0, label: 'semanas' },
  ];

  return (
    <div className="mt-5 grid grid-cols-3 gap-2.5">
      {cells.map((cell, index) => (
        <div
          key={cell.label}
          className="border-white/10 rounded-2xl border bg-white/[0.04] py-3 text-center"
        >
          <p
            className={`text-xl font-extrabold tabular-nums ${ACCENTS[index]} ${
              isLoading ? 'animate-pulse' : ''
            }`}
          >
            {isLoading ? '·' : cell.value}
          </p>
          <p className="text-slate mt-1 text-[10px]">{cell.label}</p>
        </div>
      ))}
    </div>
  );
}
