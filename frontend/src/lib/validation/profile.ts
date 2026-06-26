import { z } from 'zod';
import {
  GENDER_OPTIONS,
  SEMESTER_OPTIONS,
  MIN_AGE,
  MIN_PHOTOS,
  MAX_PHOTOS,
  MAX_BIO_LENGTH,
} from '@/lib/constants/profile';

// Returns whole years between a birth date and today.
function ageInYears(isoDate: string): number {
  const birth = new Date(isoDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDelta = now.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

const photoSchema = z.object({
  id: z.string(),
  url: z.string(),
  // Optional: existing (server) photos are kept by URL and carry no File.
  file: z.instanceof(File).optional(),
});

export const profileSchema = z.object({
  name: z.string().trim().min(1, 'Ingresa tu nombre.'),
  dateOfBirth: z
    .string()
    .min(1, 'Ingresa tu fecha de nacimiento.')
    // HU-02: users must be older than 17.
    .refine((value) => ageInYears(value) >= MIN_AGE, {
      message: `Debes ser mayor de ${MIN_AGE - 1} años.`,
    }),
  gender: z.enum(GENDER_OPTIONS, { message: 'Selecciona tu género.' }),
  height: z
    .number({ message: 'Ingresa tu estatura.' })
    .int()
    .min(120, 'Estatura inválida.')
    .max(230, 'Estatura inválida.'),
  photos: z
    .array(photoSchema)
    .min(MIN_PHOTOS, 'Agrega al menos una foto.')
    .max(MAX_PHOTOS, `Máximo ${MAX_PHOTOS} fotos.`),
  biography: z
    .string()
    .trim()
    .min(1, 'Escribe una breve biografía.')
    .max(MAX_BIO_LENGTH, `Máximo ${MAX_BIO_LENGTH} caracteres.`),
  major: z.string().trim().min(1, 'Ingresa tu carrera.'),
  semester: z.enum(SEMESTER_OPTIONS, { message: 'Selecciona tu semestre.' }),
});

export type ProfileValues = z.infer<typeof profileSchema>;
