import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deactivateVenue } from '@/lib/api/venues';

export function useDeactivateVenue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deactivateVenue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminVenues'] });
    },
  });
}
