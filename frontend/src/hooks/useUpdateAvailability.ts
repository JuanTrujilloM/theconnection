import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAvailability } from '@/lib/api/profile';
import type { AvailabilityStatus } from '@/lib/constants/profile';
import type { ProfileResponse } from '@/types/profile';

// Toggles the dashboard searching/paused status (PATCH /profile/availability).
// Optimistically flips the cached profile so the toggle feels instant, and
// rolls back if the request fails.
export function useUpdateAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (availability: AvailabilityStatus) =>
      updateAvailability(availability),
    onMutate: async (availability) => {
      await queryClient.cancelQueries({ queryKey: ['myProfile'] });
      const previous = queryClient.getQueryData<ProfileResponse | null>([
        'myProfile',
      ]);
      if (previous) {
        queryClient.setQueryData<ProfileResponse>(['myProfile'], {
          ...previous,
          availability,
        });
      }
      return { previous };
    },
    onError: (_error, _availability, context) => {
      queryClient.setQueryData(['myProfile'], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
  });
}
