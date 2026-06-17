/**
 * Supported private-university email domains (CLAUDE.md "Supported Universities").
 * The map doubles as the source for HU-02's auto-detected `Profile.university`.
 */
export const DOMAIN_TO_UNIVERSITY: Record<string, string> = {
  // Phase 1 — Medellín
  'eafit.edu.co': 'EAFIT',
  'upb.edu.co': 'UPB',
  'ces.edu.co': 'CES',
  'eia.edu.co': 'EIA',
  // Phase 2 — Bogotá
  'javeriana.edu.co': 'Javeriana',
  'uniandes.edu.co': 'Uniandes',
  'urosario.edu.co': 'Rosario',
  'externado.edu.co': 'Externado',
};

export const SUPPORTED_UNIVERSITY_DOMAINS = new Set(
  Object.keys(DOMAIN_TO_UNIVERSITY),
);

export function getEmailDomain(email: string): string {
  return email.trim().toLowerCase().split('@')[1] ?? '';
}

export function isSupportedUniversityEmail(email: string): boolean {
  return SUPPORTED_UNIVERSITY_DOMAINS.has(getEmailDomain(email));
}
