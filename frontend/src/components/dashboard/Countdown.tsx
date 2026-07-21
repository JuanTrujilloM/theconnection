'use client';

import { useCountdown } from '@/hooks/useCountdown';

// Three-cell days/hours/minutes display. `target` must be memoized by the caller
// so the underlying interval isn't recreated each render.
export function Countdown({ target }: { target: Date }) {
  const { days, hours, minutes } = useCountdown(target);

  const cells: { value: number; label: string }[] = [
    { value: days, label: days === 1 ? 'día' : 'días' },
    { value: hours, label: 'horas' },
    { value: minutes, label: 'min' },
  ];

  return (
    <div className="mt-4 flex gap-2.5">
      {cells.map((cell) => (
        <div
          key={cell.label}
          className="border-white/10 flex-1 rounded-2xl border bg-white/[0.04] py-3 text-center"
        >
          <p className="text-cream text-2xl font-extrabold tabular-nums">
            {String(cell.value).padStart(2, '0')}
          </p>
          <p className="text-slate mt-1 text-[10px] tracking-widest uppercase">
            {cell.label}
          </p>
        </div>
      ))}
    </div>
  );
}
