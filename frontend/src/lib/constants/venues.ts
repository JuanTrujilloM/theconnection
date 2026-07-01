// Venue categories the admin can assign. Stored as the Venue.type string.
export const VENUE_TYPES = [
  'Café',
  'Restaurante',
  'Bar',
  'Cine',
  'Parque',
  'Otro',
] as const;

// Mirror of the backend MIN_VENUE_SELECTION (HU-06: choose at least 2 of 3).
// Keep in sync with backend/src/modules/matches/matches.constants.ts.
export const MIN_VENUE_SELECTION = 2;
