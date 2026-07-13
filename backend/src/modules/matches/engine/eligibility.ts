import { MatchCandidate } from './types';

// Maps a profile gender to the genderInterest bucket a partner would express to
// be attracted to it. "Prefiero no decir" has no bucket, so it only matches
// partners open to "Todos".
const GENDER_TO_INTEREST: Record<string, string> = {
  Masculino: 'Hombres',
  Femenino: 'Mujeres',
  'No binario': 'No binario',
};

// genderInterest is the operative encoding of "orientation + gender preference"
// (AC #3): the enumerable data model captures who each user wants via
// genderInterest, so that is the hard filter rather than the free-form
// orientation label. "Todos" accepts any gender.
function attractedTo(viewer: MatchCandidate, target: MatchCandidate): boolean {
  if (viewer.genderInterest === 'Todos') return true;
  return GENDER_TO_INTEREST[target.gender] === viewer.genderInterest;
}

// Each user must fall inside the other's requested age band (AC #4).
function agesMutuallyInRange(a: MatchCandidate, b: MatchCandidate): boolean {
  return (
    b.age >= a.minAge &&
    b.age <= a.maxAge &&
    a.age >= b.minAge &&
    a.age <= b.maxAge
  );
}

// If either user requires the same university, both must share it (AC #5).
function universityConstraintMet(
  a: MatchCandidate,
  b: MatchCandidate,
): boolean {
  if (a.requiresSameUniversity || b.requiresSameUniversity) {
    return a.university === b.university;
  }
  return true;
}

// A pair is an edge only if every hard constraint passes in BOTH directions —
// this bidirectional check is the AC's mutual-compatibility requirement.
export function areMutuallyEligible(
  a: MatchCandidate,
  b: MatchCandidate,
): boolean {
  if (a.userId === b.userId) return false;
  // No repeats: skip anyone either user was matched with before.
  if (a.priorPartnerIds.has(b.userId)) return false;
  if (b.priorPartnerIds.has(a.userId)) return false;

  return (
    attractedTo(a, b) &&
    attractedTo(b, a) &&
    agesMutuallyInRange(a, b) &&
    universityConstraintMet(a, b)
  );
}
