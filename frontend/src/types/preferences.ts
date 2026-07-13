// Shape returned by GET /preferences/me: the raw record plus hobby names
// (hobbies live on the profile server-side and are joined in).
export interface PreferencesResponse {
  id: string;
  relationshipType: string;
  orientation: string;
  minAge: number;
  maxAge: number;
  genderInterest: string;
  sameUniversity: boolean;
  heightRange: string;
  // Stored as a single comma-joined string per the data model.
  energyVibe: string;
  hobbies: string[];
}
