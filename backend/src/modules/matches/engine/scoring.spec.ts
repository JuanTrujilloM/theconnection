import { compatibilityScore } from './scoring';
import { makeCandidate } from './test-helpers';

describe('compatibilityScore', () => {
  it('is symmetric in its arguments', () => {
    const a = makeCandidate({ userId: 'a', hobbies: ['cine', 'gym'] });
    const b = makeCandidate({ userId: 'b', hobbies: ['cine', 'lectura'] });
    expect(compatibilityScore(a, b)).toBe(compatibilityScore(b, a));
  });

  it('scores more shared hobbies higher', () => {
    const base = makeCandidate({
      userId: 'a',
      hobbies: ['cine', 'gym', 'arte'],
    });
    const few = makeCandidate({ userId: 'b', hobbies: ['cine'] });
    const many = makeCandidate({
      userId: 'c',
      hobbies: ['cine', 'gym', 'arte'],
    });
    expect(compatibilityScore(base, many)).toBeGreaterThan(
      compatibilityScore(base, few),
    );
  });

  it('rewards an exact relationship-type match over a mismatch', () => {
    const seria = makeCandidate({ userId: 'a', relationshipType: 'Seria' });
    const alsoSeria = makeCandidate({ userId: 'b', relationshipType: 'Seria' });
    const casual = makeCandidate({ userId: 'c', relationshipType: 'Casual' });
    expect(compatibilityScore(seria, alsoSeria)).toBeGreaterThan(
      compatibilityScore(seria, casual),
    );
  });

  it('honors a "Más alta" height preference', () => {
    const wantsTaller = makeCandidate({
      userId: 'a',
      height: 165,
      heightRange: 'Más alta',
    });
    const taller = makeCandidate({
      userId: 'b',
      height: 185,
      heightRange: 'Indiferente',
    });
    const shorter = makeCandidate({
      userId: 'c',
      height: 160,
      heightRange: 'Indiferente',
    });
    expect(compatibilityScore(wantsTaller, taller)).toBeGreaterThan(
      compatibilityScore(wantsTaller, shorter),
    );
  });

  it('gives reliable users a higher feedback contribution than no-shows', () => {
    const anchor = makeCandidate({ userId: 'a', reliability: 1 });
    const reliable = makeCandidate({ userId: 'b', reliability: 1 });
    const flaky = makeCandidate({ userId: 'c', reliability: -1 });
    expect(compatibilityScore(anchor, reliable)).toBeGreaterThan(
      compatibilityScore(anchor, flaky),
    );
  });
});
