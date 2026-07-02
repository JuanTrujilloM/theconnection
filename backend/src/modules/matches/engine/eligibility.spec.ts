import { areMutuallyEligible } from './eligibility';
import { makeCandidate } from './test-helpers';

describe('areMutuallyEligible', () => {
  it('accepts a mutually-attracted, in-range, no-history pair', () => {
    const man = makeCandidate({ userId: 'm' });
    const woman = makeCandidate({
      userId: 'w',
      gender: 'Femenino',
      genderInterest: 'Hombres',
    });
    expect(areMutuallyEligible(man, woman)).toBe(true);
  });

  it('rejects when attraction is not mutual', () => {
    const man = makeCandidate({ userId: 'm', genderInterest: 'Mujeres' });
    // Another man who wants women: the first is not attracted back.
    const otherMan = makeCandidate({ userId: 'm2', genderInterest: 'Mujeres' });
    expect(areMutuallyEligible(man, otherMan)).toBe(false);
  });

  it('accepts anyone when a user is open to Todos', () => {
    const open = makeCandidate({ userId: 'o', genderInterest: 'Todos' });
    const partner = makeCandidate({
      userId: 'p',
      gender: 'No binario',
      genderInterest: 'Todos',
    });
    expect(areMutuallyEligible(open, partner)).toBe(true);
  });

  it('rejects when either user is outside the other age band', () => {
    const young = makeCandidate({ userId: 'y', age: 19, maxAge: 21 });
    const older = makeCandidate({
      userId: 'o',
      gender: 'Femenino',
      genderInterest: 'Hombres',
      age: 28,
    });
    // young.maxAge (21) < older.age (28): fails one direction.
    expect(areMutuallyEligible(young, older)).toBe(false);
  });

  it('enforces same university when either side requires it', () => {
    const a = makeCandidate({ userId: 'a', requiresSameUniversity: true });
    const b = makeCandidate({
      userId: 'b',
      gender: 'Femenino',
      genderInterest: 'Hombres',
      university: 'UPB',
    });
    expect(areMutuallyEligible(a, b)).toBe(false);
  });

  it('never repeats a previous match (no-repeat rule)', () => {
    const a = makeCandidate({ userId: 'a', priorPartnerIds: new Set(['b']) });
    const b = makeCandidate({
      userId: 'b',
      gender: 'Femenino',
      genderInterest: 'Hombres',
    });
    expect(areMutuallyEligible(a, b)).toBe(false);
  });

  it('is symmetric — order of arguments does not change the verdict', () => {
    const a = makeCandidate({ userId: 'a', requiresSameUniversity: true });
    const b = makeCandidate({
      userId: 'b',
      gender: 'Femenino',
      genderInterest: 'Hombres',
      university: 'UPB',
    });
    expect(areMutuallyEligible(a, b)).toBe(areMutuallyEligible(b, a));
  });
});
