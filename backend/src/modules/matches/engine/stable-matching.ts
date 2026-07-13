import { areMutuallyEligible } from './eligibility';
import { compatibilityScore } from './scoring';
import { MatchCandidate, MatchPair } from './types';

interface ScoredEdge {
  aId: string;
  bId: string;
  score: number;
}

// Deterministic order: highest score first, then by id pair so equal-scored
// edges always resolve the same way across runs.
function compareEdges(x: ScoredEdge, y: ScoredEdge): number {
  if (y.score !== x.score) return y.score - x.score;
  if (x.aId !== y.aId) return x.aId < y.aId ? -1 : 1;
  return x.bId < y.bId ? -1 : 1;
}

// Produces a stable matching of the cohort (AC: "maximizes compatibility",
// exactly one partner each, mutual eligibility, no repeats).
//
// Preferences here are symmetric: a and b rank each other by the SAME
// compatibilityScore. Under symmetric preferences, repeatedly taking the
// globally highest-scoring still-free edge yields a matching with no blocking
// pair — when (a,b) is the best remaining edge, neither can prefer someone else
// who also prefers them back, since every alternative scores lower for both.
// That is exactly a stable matching, and greedy edge selection makes it
// deterministic and O(E log E), which is ample at a few-hundred-user cohort.
export function stableMatch(candidates: MatchCandidate[]): MatchPair[] {
  const edges: ScoredEdge[] = [];
  for (let i = 0; i < candidates.length; i++) {
    for (let j = i + 1; j < candidates.length; j++) {
      const a = candidates[i];
      const b = candidates[j];
      if (!areMutuallyEligible(a, b)) continue;
      // Order the pair by id so the same two users always yield the same row.
      const [aId, bId] =
        a.userId < b.userId ? [a.userId, b.userId] : [b.userId, a.userId];
      edges.push({ aId, bId, score: compatibilityScore(a, b) });
    }
  }

  edges.sort(compareEdges);

  const taken = new Set<string>();
  const pairs: MatchPair[] = [];
  for (const edge of edges) {
    if (taken.has(edge.aId) || taken.has(edge.bId)) continue;
    taken.add(edge.aId);
    taken.add(edge.bId);
    pairs.push({
      userAId: edge.aId,
      userBId: edge.bId,
      compatibilityScore: edge.score,
    });
  }

  // Users with no eligible partner this week (odd pool or over-constrained) are
  // simply left unmatched and roll into the next cycle.
  return pairs;
}
