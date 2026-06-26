import { apiClient } from './client';
import type { ProfileResponse } from '@/types/profile';
import type { AvailabilityStatus } from '@/lib/constants/profile';

// HU-02 — sends the profile as multipart/form-data (fields + photo files).
// The browser sets the multipart boundary; don't set Content-Type manually.
// Used for both creating (onboarding) and editing the profile.
export async function createProfile(formData: FormData): Promise<void> {
  await apiClient.post('/profile', formData);
}

// Returns the current user's saved profile, or null if none yet.
export async function fetchMyProfile(): Promise<ProfileResponse | null> {
  const { data } = await apiClient.get<ProfileResponse | null>('/profile/me');
  return data;
}

// Flips the dashboard searching/paused toggle. Returns the updated profile.
export async function updateAvailability(
  availability: AvailabilityStatus,
): Promise<ProfileResponse> {
  const { data } = await apiClient.patch<ProfileResponse>(
    '/profile/availability',
    { availability },
  );
  return data;
}
