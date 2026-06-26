import { z } from 'zod';
import {
  AGE_BOUNDS,
  MIN_HOBBIES,
  MIN_VIBES,
  RELATIONSHIP_OPTIONS,
  ORIENTATION_OPTIONS,
  GENDER_INTEREST_OPTIONS,
  HEIGHT_RANGE_OPTIONS,
} from '@/lib/constants/preferences';

export const preferencesSchema = z.object({
  ageRange: z
    .object({
      min: z.number().min(AGE_BOUNDS.min).max(AGE_BOUNDS.max),
      max: z.number().min(AGE_BOUNDS.min).max(AGE_BOUNDS.max),
    })
    .refine((range) => range.min < range.max, {
      message: 'El rango de edad no es válido.',
    }),
  hobbies: z
    .array(z.string())
    .min(MIN_HOBBIES, `Selecciona al menos ${MIN_HOBBIES} hobbies.`),
  relationshipType: z.enum(RELATIONSHIP_OPTIONS, {
    message: 'Selecciona qué tipo de relación buscas.',
  }),
  orientation: z.enum(ORIENTATION_OPTIONS, {
    message: 'Selecciona tu orientación.',
  }),
  genderInterest: z.enum(GENDER_INTEREST_OPTIONS, {
    message: 'Selecciona qué género te interesa.',
  }),
  sameUniversity: z.boolean({
    message: 'Indica tu preferencia de universidad.',
  }),
  heightRange: z.enum(HEIGHT_RANGE_OPTIONS, {
    message: 'Selecciona tu preferencia de estatura.',
  }),
  energyVibe: z
    .array(z.string())
    .min(MIN_VIBES, 'Selecciona al menos una opción.'),
});

export type PreferencesValues = z.infer<typeof preferencesSchema>;
