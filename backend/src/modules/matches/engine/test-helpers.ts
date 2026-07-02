import { MatchCandidate } from './types';

// Builds a fully-eligible baseline candidate; tests override only what they
// exercise. Defaults describe a hetero man, 22, EAFIT, open preferences.
export function makeCandidate(
  overrides: Partial<MatchCandidate> = {},
): MatchCandidate {
  return {
    userId: 'user',
    gender: 'Masculino',
    genderInterest: 'Mujeres',
    age: 22,
    minAge: 18,
    maxAge: 30,
    university: 'EAFIT',
    requiresSameUniversity: false,
    relationshipType: 'Seria',
    major: 'Ingeniería',
    semester: '6',
    height: 175,
    heightRange: 'Indiferente',
    vibes: ['tranquila'],
    hobbies: ['cine', 'senderismo'],
    biographyTokens: ['viajar', 'musica'],
    reliability: 0,
    priorPartnerIds: new Set(),
    ...overrides,
  };
}
