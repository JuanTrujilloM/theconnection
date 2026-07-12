import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchAvailabilityView,
  fetchTokenVenues,
  selectTokenVenues,
  submitAvailability,
} from '@/lib/api/availability';
import type { SlotSelection } from '@/types/availability';

// Both pages redirect off the cached `step`, so every mutation invalidates both
// token queries — a stale step would ping-pong the user between the two pages.
function useInvalidateTokenFlow(token: string) {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['availability', token] }),
      queryClient.invalidateQueries({ queryKey: ['tokenVenues', token] }),
    ]);
}

// HU-09 — loads the calendar (or the redirect signal) for a link token. retry
// is off so an invalid/expired token surfaces the error view immediately.
export function useAvailabilityView(token: string) {
  return useQuery({
    queryKey: ['availability', token],
    queryFn: () => fetchAvailabilityView(token),
    retry: false,
  });
}

export function useSubmitAvailability(token: string) {
  const invalidate = useInvalidateTokenFlow(token);
  return useMutation({
    mutationFn: (slots: SlotSelection[]) => submitAvailability(token, slots),
    onSuccess: invalidate,
  });
}

// HU-06 over the same token — the public place-selection step (first step).
export function useTokenVenues(token: string) {
  return useQuery({
    queryKey: ['tokenVenues', token],
    queryFn: () => fetchTokenVenues(token),
    retry: false,
  });
}

export function useSelectTokenVenues(token: string) {
  const invalidate = useInvalidateTokenFlow(token);
  return useMutation({
    mutationFn: (venueIds: string[]) => selectTokenVenues(token, venueIds),
    onSuccess: invalidate,
  });
}
