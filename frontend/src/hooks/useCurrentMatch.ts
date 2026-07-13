import { useQuery } from '@tanstack/react-query';
import { fetchCurrentMatch } from '@/lib/api/matches';

// Loads the active match (GET /matches/current). Used to drive the dashboard
// redirect into HU-06 place selection.
export function useCurrentMatch(enabled = true) {
  return useQuery({
    queryKey: ['currentMatch'],
    queryFn: fetchCurrentMatch,
    enabled,
    retry: false,
  });
}
