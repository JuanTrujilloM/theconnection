import { useQuery } from '@tanstack/react-query';
import { fetchMyPreferences } from '@/lib/api/preferences';

// Loads the saved preferences to pre-fill the edit form (GET /preferences/me).
export function useMyPreferences(enabled = true) {
  return useQuery({
    queryKey: ['myPreferences'],
    queryFn: fetchMyPreferences,
    enabled,
    retry: false,
  });
}
