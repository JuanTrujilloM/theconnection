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

// Matching status stored on Profile.status, toggled from the dashboard.
// Mirror of the backend (AVAILABILITY_STATUSES); keep both in sync.
export const AVAILABILITY_STATUS = {
  SEARCHING: 'SEARCHING',
  PAUSED: 'PAUSED',
} as const;

export type AvailabilityStatus =
  (typeof AVAILABILITY_STATUS)[keyof typeof AVAILABILITY_STATUS];

// User-facing labels for each status (the stored value stays language-neutral).
export const AVAILABILITY_LABELS: Record<AvailabilityStatus, string> = {
  SEARCHING: 'Buscando cita',
  PAUSED: 'En pausa',
};
