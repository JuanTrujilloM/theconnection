import axios from 'axios';

// Pulls a human-readable message out of an axios error. NestJS validation errors
// arrive as a string[]; everything else as a string. Falls back to a generic line.
export function getApiErrorMessage(
  error: unknown,
  fallback = 'Algo salió mal. Intenta de nuevo.',
): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message) && message.length > 0) return String(message[0]);
    if (typeof message === 'string') return message;
  }
  return fallback;
}
