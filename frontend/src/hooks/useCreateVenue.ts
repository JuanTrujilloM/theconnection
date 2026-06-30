import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createVenue } from '@/lib/api/venues';

export function useCreateVenue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVenue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminVenues'] });
    },
  });
}
