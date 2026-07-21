'use client';

import Link from 'next/link';
import { useMyPreferences } from '@/hooks/useMyPreferences';

const MAX_VISIBLE = 6;

// "Tu vibe": a glanceable summary of the user's hobbies, linking to editing.
export function VibeChips() {
  const { data: preferences } = useMyPreferences();
  const hobbies = preferences?.hobbies ?? [];
  if (hobbies.length === 0) return null;

  const visible = hobbies.slice(0, MAX_VISIBLE);
  const extra = hobbies.length - visible.length;

  return (
    <div className="mt-3">
      <p className="text-slate mb-2 px-1 text-[11px] font-semibold tracking-widest uppercase">
        Tu vibe
      </p>
      <div className="flex flex-wrap gap-2">
        {visible.map((hobby) => (
          <span
            key={hobby}
            className="border-flame/30 bg-flame/[0.1] rounded-full border px-3 py-1.5 text-xs text-[#ffc79c]"
          >
            {hobby}
          </span>
        ))}
        {extra > 0 && (
          <Link
            href="/intereses"
            className="border-white/15 text-slate hover:text-cream rounded-full border bg-white/[0.05] px-3 py-1.5 text-xs"
          >
            +{extra}
          </Link>
        )}
      </div>
    </div>
  );
}
