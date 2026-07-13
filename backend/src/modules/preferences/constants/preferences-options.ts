// Allowed values for interests & preferences (HU-03). Mirror of the frontend
// constants (frontend/src/lib/constants/preferences.ts); keep both in sync.
export const RELATIONSHIP_TYPES = [
  'Casual',
  'Seria',
  'Amistad',
  'Casual abierto a seria',
  'Seria abierta a casual',
  'Abierto a todo',
] as const;

export const ORIENTATIONS = [
  'Heterosexual',
  'Gay',
  'Lesbiana',
  'Bisexual',
  'Otro',
  'Prefiero no decir',
] as const;

export const GENDER_INTERESTS = [
  'Hombres',
  'Mujeres',
  'No binario',
  'Todos',
] as const;

export const HEIGHT_RANGES = [
  'Indiferente',
  'Más baja',
  'Similar',
  'Más alta',
] as const;

export const AGE_MIN = 18;
export const AGE_MAX = 40;
export const MIN_HOBBIES = 3;
export const MIN_VIBES = 1;

// Default category for hobbies created on the fly from the tag input.
export const DEFAULT_HOBBY_CATEGORY = 'general';
