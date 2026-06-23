// Allowed values for the personal profile (HU-02). Mirror of the frontend
// constants (frontend/src/lib/constants/profile.ts); keep both in sync.
export const GENDERS = [
  'Masculino',
  'Femenino',
  'No binario',
  'Prefiero no decir',
] as const;

export const SEMESTERS = [
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

// HU-02: users must be older than 17.
export const MIN_AGE = 18;
export const MAX_PHOTOS = 5;
export const MAX_BIO_LENGTH = 150;
