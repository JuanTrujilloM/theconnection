export interface MatchPartner {
  name: string;
  age: number;
  university: string;
  major: string;
  biography: string;
  photoUrl: string | null;
}

export interface CurrentMatch {
  id: string;
  status: string;
  partner: MatchPartner | null;
}
