// Shared formatters for the admin panel. COP has no decimals in practice.
export function formatCOP(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string | Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

// Pure calendar date (@db.Date, e.g. an availability day). Prisma returns it as
// UTC midnight, so format in UTC — otherwise a negative-offset viewer sees the
// day before. Do NOT use for real timestamps (createdAt, scheduledAt).
export function formatCalendarDate(value: string | Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value));
}

export function formatDateTime(value: string | Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
