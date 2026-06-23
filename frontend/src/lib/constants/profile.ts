// Select options for the personal profile form (HU-02). Kept as const tuples so
// the Zod schema and the UI share one source of truth.
export const GENDER_OPTIONS = [
  'Masculino',
  'Femenino',
  'No binario',
  'Prefiero no decir',
] as const;

export const SEMESTER_OPTIONS = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'Especialización',
  'Maestría',
  'Doctorado',
] as const;

// Minimum age allowed to register (HU-02: must be older than 17).
export const MIN_AGE = 18;

// Photo upload bounds (HU-02: 1–5 photos).
export const MIN_PHOTOS = 1;
export const MAX_PHOTOS = 5;

// Biography character cap (HU-02).
export const MAX_BIO_LENGTH = 150;

// Time-of-day availability options (HU-09 onboarding step). Stored on the
// profile as a comma-joined string; mirror of the backend.
export const AVAILABILITY_OPTIONS = [
  'Mañana',
  'Tarde',
  'Noche',
  'Todo el día',
] as const;
