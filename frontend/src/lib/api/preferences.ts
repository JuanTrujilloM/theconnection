import { apiClient } from './client';
import type { PreferencesValues } from '@/lib/validation/preferences';
import type { PreferencesResponse } from '@/types/preferences';

// HU-03 — the form values match the backend DTO shape exactly, so they post as-is.
// The backend upserts, so this is used for both creating and editing.
export async function createPreferences(
  values: PreferencesValues,
): Promise<void> {
  await apiClient.post('/preferences', values);
}

// Returns the current user's saved preferences, or null if none yet.
export async function fetchMyPreferences(): Promise<PreferencesResponse | null> {
  const { data } = await apiClient.get<PreferencesResponse | null>(
    '/preferences/me',
  );
  return data;
}
