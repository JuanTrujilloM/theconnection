// Venue categories the admin can assign. Stored as the Venue.type string.
export const VENUE_TYPES = [
  'Café',
  'Restaurante',
  'Bar',
  'Cine',
  'Parque',
  'Otro',
] as const;

// Mirror of the backend MIN_VENUE_SELECTION (HU-06: choose exactly 2 of 3, so
// both users are guaranteed a shared venue). Used as both min and max on the
// client. Keep in sync with backend/src/modules/matches/matches.constants.ts.
export const MIN_VENUE_SELECTION = 2;
