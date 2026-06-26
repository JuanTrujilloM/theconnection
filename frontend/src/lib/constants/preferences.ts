// Options and suggestions for the interests & preferences step (HU-03).

export const AGE_BOUNDS = { min: 18, max: 40 } as const;

// Minimum selections required by the user story.
export const MIN_HOBBIES = 3;
export const MIN_VIBES = 1;

export const HOBBY_SUGGESTIONS = [
  'Música',
  'Deportes',
  'Viajes',
  'Lectura',
  'Fotografía',
  'Cocina',
  'Arte',
  'Gaming',
  'Cine',
  'Yoga',
];

export const RELATIONSHIP_OPTIONS = [
  'Casual',
  'Seria',
  'Amistad',
  'Casual abierto a seria',
  'Seria abierta a casual',
  'Abierto a todo',
] as const;

export const ORIENTATION_OPTIONS = [
  'Heterosexual',
  'Gay',
  'Lesbiana',
  'Bisexual',
  'Otro',
  'Prefiero no decir',
] as const;

export const GENDER_INTEREST_OPTIONS = [
  'Hombres',
  'Mujeres',
  'No binario',
  'Todos',
] as const;

export const HEIGHT_RANGE_OPTIONS = [
  'Indiferente',
  'Más baja',
  'Similar',
  'Más alta',
] as const;

export const VIBE_OPTIONS = [
  'Introvertido/a',
  'Extrovertido/a',
  'Aventurero/a',
  'Tranquilo/a',
  'Creativo/a',
  'Ambicioso/a',
  'Romántico/a',
  'Espontáneo/a',
];
