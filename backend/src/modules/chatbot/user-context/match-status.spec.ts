import { ACTIVE_MATCH_STATUSES, matchStatusLabel } from './match-status';

describe('matchStatusLabel', () => {
  it('maps pending to "pendiente de aceptación"', () => {
    expect(matchStatusLabel('pending', false)).toBe('Pendiente de aceptación');
  });

  it('maps confirmed without a date to "aceptado"', () => {
    expect(matchStatusLabel('confirmed', false)).toBe('Aceptado');
  });

  it('maps confirmed with a date to "cita agendada"', () => {
    expect(matchStatusLabel('confirmed', true)).toBe('Cita agendada');
  });

  it('maps completed and canceled', () => {
    expect(matchStatusLabel('completed', false)).toBe('Cita realizada');
    expect(matchStatusLabel('canceled', false)).toBe('Cancelado');
  });

  it('only treats pending/confirmed as active', () => {
    expect(ACTIVE_MATCH_STATUSES).toEqual(['pending', 'confirmed']);
  });
});
