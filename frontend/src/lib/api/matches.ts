import { apiClient } from './client';
import type { CurrentMatch } from '@/types/match';

// Returns the user's active match (or null). Drives the dashboard redirect.
export async function fetchCurrentMatch(): Promise<CurrentMatch | null> {
  const { data } = await apiClient.get<CurrentMatch | null>('/matches/current');
  return data;
}
