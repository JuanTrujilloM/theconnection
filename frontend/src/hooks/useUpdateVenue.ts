import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateVenue } from '@/lib/api/venues';
import type { VenuePayload } from '@/types/venue';

export function useUpdateVenue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<VenuePayload> }) =>
      updateVenue(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminVenues'] });
    },
  });
}
