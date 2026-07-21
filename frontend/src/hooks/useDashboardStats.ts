import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats } from '@/lib/api/matches';

// Loads the dashboard counters (GET /matches/stats).
export function useDashboardStats(enabled = true) {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
    enabled,
    retry: false,
  });
}
