// Admin shape — the full Venue row, including internal business fields.
export interface Venue {
  id: string;
  name: string;
  type: string;
  address: string;
  openingHours: string;
  description: string;
  commissionRate: number;
  averageSpentPerPerson: number;
  active: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Student-facing HU-06 suggestion — no commissionRate, plus this user's choice.
export interface VenueSuggestion {
  id: string;
  name: string;
  type: string;
  address: string;
  openingHours: string;
  description: string;
  tags: string[];
  averageSpentPerPerson: number;
  selected: boolean;
}

// Create/update payload for the admin form.
export interface VenuePayload {
  name: string;
  type: string;
  address: string;
  openingHours: string;
  description: string;
  commissionRate: number;
  averageSpentPerPerson: number;
  tags: string[];
  active: boolean;
}
