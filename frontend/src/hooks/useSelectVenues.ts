import { useMutation, useQueryClient } from '@tanstack/react-query';
import { selectVenues } from '@/lib/api/venues';

// Saves the user's HU-06 choices (POST /matches/current/venue-selection), then
// refreshes the match + suggestions so the pending flag and toggles update.
export function useSelectVenues() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (venueIds: string[]) => selectVenues(venueIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentMatch'] });
      queryClient.invalidateQueries({ queryKey: ['venueSuggestions'] });
    },
  });
}
