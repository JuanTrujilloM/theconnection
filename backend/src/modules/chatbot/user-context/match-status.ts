// Match/Date status vocabulary written by the weekly matching flow:
// pending, confirmed, completed, canceled. Keep in sync with that producer.
// A match is "current" only while pending or confirmed.
export const ACTIVE_MATCH_STATUSES = ['pending', 'confirmed'] as const;

// Maps the raw match status to the user-facing label the chatbot speaks (Spanish).
// "Cita agendada" is derived from a confirmed Date existing, so it can be told
// apart from a match that was accepted but not yet scheduled.
export function matchStatusLabel(
  status: string,
  hasConfirmedDate: boolean,
): string {
  switch (status) {
    case 'pending':
      return 'Pendiente de aceptación';
    case 'confirmed':
      return hasConfirmedDate ? 'Cita agendada' : 'Aceptado';
    case 'completed':
      return 'Cita realizada';
    case 'canceled':
      return 'Cancelado';
    default:
      return status;
  }
}
