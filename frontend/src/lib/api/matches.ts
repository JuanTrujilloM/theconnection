import { apiClient } from './client';
import type { CurrentMatch } from '@/types/match';
import type { DashboardStats } from '@/types/stats';

// Returns the user's active match (or null). Drives the dashboard redirect.
export async function fetchCurrentMatch(): Promise<CurrentMatch | null> {
  const { data } = await apiClient.get<CurrentMatch | null>('/matches/current');
  return data;
}

// Dashboard counters (matches, dates, weeks active).
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const { data } = await apiClient.get<DashboardStats>('/matches/stats');
  return data;
}
