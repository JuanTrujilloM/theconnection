import type { ProfileResponse } from '@/types/profile';
import type { PreferencesResponse } from '@/types/preferences';
import { MAX_PHOTOS } from '@/lib/constants/profile';

export interface ProfileCompleteness {
  pct: number;
  hint: string | null;
}

interface Check {
  done: boolean;
  hint: string;
}

// Derives a completeness % from data the user can still improve, plus a hint for
// the first unmet item. Purely client-side — no backend field to keep in sync.
export function computeProfileCompleteness(
  profile: ProfileResponse | null | undefined,
  preferences: PreferencesResponse | null | undefined,
): ProfileCompleteness {
  const photoCount = profile?.photos.length ?? 0;
  const hobbyCount = preferences?.hobbies.length ?? 0;

  const checks: Check[] = [
    {
      done: Boolean(profile?.biography?.trim()),
      hint: 'Escribe una biografía para destacar.',
    },
    { done: photoCount >= 3, hint: 'Sube al menos 3 fotos.' },
    {
      done: photoCount >= MAX_PHOTOS,
      hint: `Completa tu galería con ${MAX_PHOTOS} fotos.`,
    },
    { done: Boolean(preferences), hint: 'Define tus preferencias.' },
    { done: hobbyCount >= 3, hint: 'Añade al menos 3 hobbies.' },
  ];

  const doneCount = checks.filter((check) => check.done).length;
  const pct = Math.round((doneCount / checks.length) * 100);
  const hint = checks.find((check) => !check.done)?.hint ?? null;

  return { pct, hint };
}
