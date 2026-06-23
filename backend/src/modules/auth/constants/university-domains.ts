// Supported private-university email domains (CLAUDE.md "Supported Universities").
// The map doubles as the source for HU-02's auto-detected Profile.university.
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

// Normalizes an email for consistent processing and comparison: trim + lowercase.
export function getEmailDomain(email: string): string {
  return email.trim().toLowerCase().split('@')[1] ?? '';
}

// Checks if the email belongs to a supported university domain.
export function isSupportedUniversityEmail(email: string): boolean {
  return SUPPORTED_UNIVERSITY_DOMAINS.has(getEmailDomain(email));
}

// Resolves the university name from a verified email. Derived server-side so the
// stored Profile.university can't be spoofed by the client (HU-02).
export function universityFromEmail(email: string): string {
  return (
    DOMAIN_TO_UNIVERSITY[getEmailDomain(email)] ?? 'Universidad verificada'
  );
}
