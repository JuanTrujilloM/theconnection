export interface MatchPartner {
  name: string;
  age: number;
  university: string;
  major: string;
  biography: string;
  photoUrl: string | null;
}

// Confirmed-date details, present only once the match is scheduled (HU-08).
export interface MatchDate {
  venueName: string;
  address: string;
  scheduledAt: string;
}

export interface CurrentMatch {
  id: string;
  status: string;
  // 0–100, already normalized server-side from the raw compatibility score.
  compatibilityPercent: number;
  partner: MatchPartner | null;
  date: MatchDate | null;
}
