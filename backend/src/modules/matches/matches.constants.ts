// HU-06: exactly 3 places are suggested and each user picks exactly 2 (MIN == MAX).
// Two 2-element subsets of a 3-element set always intersect, so both users are
// guaranteed at least one venue in common (pigeonhole) — that overlap is the date
// venue. Shared by the service (generation) and the DTO (validation) so they agree.
export const SUGGESTION_COUNT = 3;
export const MIN_VENUE_SELECTION = 2;
