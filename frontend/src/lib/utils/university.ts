// Maps a supported university email domain to its display name. Mirrors the
// supported-domains list; used to auto-fill the read-only university field (HU-02)
// from the authenticated user's email.
const DOMAIN_TO_UNIVERSITY: Record<string, string> = {
  'eafit.edu.co': 'Universidad EAFIT',
  'upb.edu.co': 'Universidad Pontificia Bolivariana',
  'ces.edu.co': 'Universidad CES',
  'eia.edu.co': 'Universidad EIA',
  'javeriana.edu.co': 'Pontificia Universidad Javeriana',
  'uniandes.edu.co': 'Universidad de los Andes',
  'urosario.edu.co': 'Universidad del Rosario',
  'externado.edu.co': 'Universidad Externado de Colombia',
};

export function universityFromEmail(email: string): string {
  const domain = email.trim().toLowerCase().split('@')[1] ?? '';
  return DOMAIN_TO_UNIVERSITY[domain] ?? 'Universidad verificada';
}
