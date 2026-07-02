// Weekly matching runs Sunday 19:00 Colombia time (HU-04). Colombia has no DST,
// so America/Bogota is a stable UTC-5; the timeZone option keeps it correct even
// if the container clock is UTC. Day 0 = Sunday in cron.
export const WEEKLY_MATCHING_CRON = '0 19 * * 0';
export const WEEKLY_MATCHING_TIMEZONE = 'America/Bogota';

// Status stamped on generated matches. Mirrors the vocabulary the consumers read
// (see chatbot/user-context/match-status.ts); a fresh match starts unaccepted.
export const GENERATED_MATCH_STATUS = 'pending';

// Soft-score weights. Each term is normalized to roughly [0,1] before weighting,
// so a weight is the maximum points that signal can contribute. Tuning these
// changes ranking only; eligibility (hard filters) is unaffected.
export const SCORE_WEIGHTS = {
  sharedHobbies: 5, // AC #1 — strongest signal for a good date
  relationshipType: 3, // AC #2
  sameMajor: 1, // AC #5
  semesterProximity: 1, // AC #6
  biography: 2, // AC #7
  height: 1, // AC #8 (height component)
  vibe: 2, // AC #8 (energy/vibe component)
  feedback: 1, // AC #9 — partner reliability nudge
} as const;

// A shared hobby is worth full weight up to this many; beyond it adds nothing,
// so one pair with 8 identical hobbies doesn't dwarf every other signal.
export const MAX_SCORED_SHARED_HOBBIES = 4;

// "Similar" height counts as satisfied within this many cm either way.
export const SIMILAR_HEIGHT_CM = 5;
