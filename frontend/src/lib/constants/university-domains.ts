// Supported private-university email domains. Mirror of the backend list
// (src/modules/auth/constants/university-domains.ts) — keep both in sync; there
// is no shared package between frontend and backend yet.
export const SUPPORTED_UNIVERSITY_DOMAINS = [
  'eafit.edu.co',
  'upb.edu.co',
  'ces.edu.co',
  'eia.edu.co',
  'javeriana.edu.co',
  'uniandes.edu.co',
  'urosario.edu.co',
  'externado.edu.co',
] as const;

export function isSupportedUniversityEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split('@')[1] ?? '';
  return (SUPPORTED_UNIVERSITY_DOMAINS as readonly string[]).includes(domain);
}
