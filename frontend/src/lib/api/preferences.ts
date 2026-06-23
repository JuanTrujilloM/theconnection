import { apiClient } from './client';
import type { PreferencesValues } from '@/lib/validation/preferences';

// HU-03 — the form values match the backend DTO shape exactly, so they post as-is.
export async function createPreferences(
  values: PreferencesValues,
): Promise<void> {
  await apiClient.post('/preferences', values);
}
