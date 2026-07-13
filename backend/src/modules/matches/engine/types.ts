// Flattened, infra-free view of one student used by the matching engine. The
// service maps Prisma rows into this shape so the engine has no DB dependency
// and can be unit-tested in isolation.
export interface MatchCandidate {
  userId: string;

  // Hard-filter inputs (AC #3, #4, #5).
  gender: string; // Profile.gender vocab
  genderInterest: string; // Preferences.genderInterest vocab
  age: number; // derived from dateOfBirth
  minAge: number;
  maxAge: number;
  university: string;
  requiresSameUniversity: boolean;

  // Soft-score inputs (AC #1, #2, #5, #6, #7, #8, #9).
  relationshipType: string;
  major: string;
  semester: string;
  height: number; // cm
  heightRange: string; // Preferences.heightRange vocab (relative to own height)
  vibes: string[]; // Preferences.energyVibe, split from its stored CSV
  hobbies: string[]; // lowercased hobby names
  biographyTokens: string[]; // lowercased, stop-word-filtered bio words
  reliability: number; // [-1,1] from past-date attendance (AC #9)

  // Users this person has already been matched with (any past week). Excluded
  // from eligibility so the same pair never repeats (AC: no repeats).
  priorPartnerIds: Set<string>;
}

// One engine result: an unordered pair plus the symmetric compatibility score
// that both users will see on their Match row.
export interface MatchPair {
  userAId: string;
  userBId: string;
  compatibilityScore: number;
}
