import { useQuery } from '@tanstack/react-query';
import { fetchVenues } from '@/lib/api/venues';

// Admin venue list (GET /admin/venues). `enabled` lets the page skip the call
// for non-admins before the redirect kicks in.
export function useVenues(enabled = true) {
  return useQuery({
    queryKey: ['adminVenues'],
    queryFn: fetchVenues,
    enabled,
    retry: false,
  });
}
