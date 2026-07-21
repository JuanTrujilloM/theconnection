'use client';

import Link from 'next/link';
import { useMyProfile } from '@/hooks/useMyProfile';
import { useMyPreferences } from '@/hooks/useMyPreferences';
import { computeProfileCompleteness } from '@/lib/profileCompleteness';

export function ProfileCompleteness() {
  const { data: profile } = useMyProfile();
  const { data: preferences } = useMyPreferences();
  const { pct, hint } = computeProfileCompleteness(profile, preferences);

  return (
    <Link
      href="/perfil"
      className="border-white/10 mt-3 block rounded-2xl border bg-white/[0.03] p-4 transition hover:bg-white/[0.05]"
    >
      <div className="flex items-center justify-between text-sm">
        <span className="text-cream">Perfil completo</span>
        <span className="text-cyan font-bold tabular-nums">{pct}%</span>
      </div>
      <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="from-cyan h-full rounded-full bg-gradient-to-r to-[#5df2ff]"
          style={{ width: `${pct}%` }}
        />
      </div>
      {hint && <p className="text-slate mt-2.5 text-xs">{hint}</p>}
    </Link>
  );
}
