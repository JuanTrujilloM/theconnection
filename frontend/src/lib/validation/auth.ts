import { z } from 'zod';
import { isSupportedUniversityEmail } from '@/lib/constants/university-domains';

// Colombian mobile: 10 digits starting with 3, optional +57 country code.
const COLOMBIAN_MOBILE = /^(\+?57)?3\d{9}$/;

export const registerSchema = z.object({
  email: z
    .email('Ingresa un correo electrónico válido.')
    .refine(isSupportedUniversityEmail, {
      message: 'Solo se aceptan correos universitarios verificados.',
    }),
  cellphone: z
    .string()
    .trim()
    .regex(COLOMBIAN_MOBILE, 'Ingresa un número celular colombiano válido.'),
});

export const verifySchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'El código debe tener 6 dígitos.'),
});

// Login is passwordless: just the university email; the code is sent by email.
export const loginSchema = z.object({
  email: registerSchema.shape.email,
});

export type RegisterValues = z.infer<typeof registerSchema>;
export type VerifyValues = z.infer<typeof verifySchema>;
export type LoginValues = z.infer<typeof loginSchema>;
