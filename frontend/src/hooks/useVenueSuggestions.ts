import { useQuery } from '@tanstack/react-query';
import { fetchVenueSuggestions } from '@/lib/api/venues';

// HU-06 — the 3 suggested places for the current match.
export function useVenueSuggestions() {
  return useQuery({
    queryKey: ['venueSuggestions'],
    queryFn: fetchVenueSuggestions,
    retry: false,
  });
}
