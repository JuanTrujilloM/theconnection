import {
  SCORE_WEIGHTS,
  MAX_SCORED_SHARED_HOBBIES,
  SIMILAR_HEIGHT_CM,
} from '../weekly-matching.constants';
import { MatchCandidate } from './types';

// Every term below is symmetric in (a, b) — either it treats both the same or
// it averages the two one-directional views — so both users get one identical
// compatibilityScore. Each term is normalized to ~[0,1] before its weight.

function intersectionSize(a: string[], b: string[]): number {
  const other = new Set(b);
  return a.filter((item) => other.has(item)).length;
}

// AC #1: shared hobbies, capped so a huge overlap can't drown other signals.
function sharedHobbyTerm(a: MatchCandidate, b: MatchCandidate): number {
  const shared = intersectionSize(a.hobbies, b.hobbies);
  return (
    Math.min(shared, MAX_SCORED_SHARED_HOBBIES) / MAX_SCORED_SHARED_HOBBIES
  );
}

// AC #2: exact intent match is ideal; "Abierto a todo" flexes toward anyone.
function relationshipTerm(a: MatchCandidate, b: MatchCandidate): number {
  if (a.relationshipType === b.relationshipType) return 1;
  const OPEN = 'Abierto a todo';
  if (a.relationshipType === OPEN || b.relationshipType === OPEN) return 0.5;
  return 0;
}

// AC #5: same major is a small plus, not a requirement.
function majorTerm(a: MatchCandidate, b: MatchCandidate): number {
  return a.major === b.major ? 1 : 0;
}

// AC #6: closer semesters score higher. Non-numeric levels (Maestría, etc.)
// only align when identical.
function semesterTerm(a: MatchCandidate, b: MatchCandidate): number {
  const na = Number(a.semester);
  const nb = Number(b.semester);
  if (Number.isNaN(na) || Number.isNaN(nb)) {
    return a.semester === b.semester ? 1 : 0;
  }
  // 9 = span between semester 1 and 10, the numeric range in the vocab.
  return Math.max(0, 1 - Math.abs(na - nb) / 9);
}

// AC #7: overlap of biography keywords over the smaller vocabulary, so a short
// bio isn't penalized for having fewer words.
function biographyTerm(a: MatchCandidate, b: MatchCandidate): number {
  if (a.biographyTokens.length === 0 || b.biographyTokens.length === 0)
    return 0;
  const shared = intersectionSize(a.biographyTokens, b.biographyTokens);
  const smaller = Math.min(a.biographyTokens.length, b.biographyTokens.length);
  return shared / smaller;
}

// Does `viewer`'s height preference approve of `target`'s height, relative to
// the viewer's own height?
function heightPreferenceMet(
  viewer: MatchCandidate,
  target: MatchCandidate,
): boolean {
  const delta = target.height - viewer.height;
  switch (viewer.heightRange) {
    case 'Más alta':
      return delta > 0;
    case 'Más baja':
      return delta < 0;
    case 'Similar':
      return Math.abs(delta) <= SIMILAR_HEIGHT_CM;
    default: // "Indiferente" or unknown
      return true;
  }
}

// AC #8 (height): average of each user's preference being satisfied.
function heightTerm(a: MatchCandidate, b: MatchCandidate): number {
  const aOk = heightPreferenceMet(a, b) ? 1 : 0;
  const bOk = heightPreferenceMet(b, a) ? 1 : 0;
  return (aOk + bOk) / 2;
}

// AC #8 (energy/vibe): overlap of desired vibes over the smaller set.
function vibeTerm(a: MatchCandidate, b: MatchCandidate): number {
  if (a.vibes.length === 0 || b.vibes.length === 0) return 0;
  const shared = intersectionSize(a.vibes, b.vibes);
  return shared / Math.min(a.vibes.length, b.vibes.length);
}

// AC #9: nudge from each user's past-date reliability, remapped from [-1,1] to
// [0,1] so a reliable pair scores higher than a pair of frequent no-shows.
function feedbackTerm(a: MatchCandidate, b: MatchCandidate): number {
  const average = (a.reliability + b.reliability) / 2;
  return (average + 1) / 2;
}

// Weighted sum of all soft signals. Callers should only score pairs that passed
// areMutuallyEligible; this function assumes the hard filters already held.
export function compatibilityScore(
  a: MatchCandidate,
  b: MatchCandidate,
): number {
  const score =
    SCORE_WEIGHTS.sharedHobbies * sharedHobbyTerm(a, b) +
    SCORE_WEIGHTS.relationshipType * relationshipTerm(a, b) +
    SCORE_WEIGHTS.sameMajor * majorTerm(a, b) +
    SCORE_WEIGHTS.semesterProximity * semesterTerm(a, b) +
    SCORE_WEIGHTS.biography * biographyTerm(a, b) +
    SCORE_WEIGHTS.height * heightTerm(a, b) +
    SCORE_WEIGHTS.vibe * vibeTerm(a, b) +
    SCORE_WEIGHTS.feedback * feedbackTerm(a, b);

  // Round to 4 decimals so scores are stable and comparable across runs.
  return Math.round(score * 10000) / 10000;
}
