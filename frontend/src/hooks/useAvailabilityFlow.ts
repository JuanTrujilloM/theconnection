import { useMutation, useQuery } from '@tanstack/react-query';
import {
  fetchAvailabilityView,
  fetchTokenVenues,
  selectTokenVenues,
  submitAvailability,
} from '@/lib/api/availability';
import type { SlotSelection } from '@/types/availability';

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
  return useMutation({
    mutationFn: (slots: SlotSelection[]) => submitAvailability(token, slots),
  });
}

// HU-06 over the same token — the public place-selection step.
export function useTokenVenues(token: string) {
  return useQuery({
    queryKey: ['tokenVenues', token],
    queryFn: () => fetchTokenVenues(token),
    retry: false,
  });
}

export function useSelectTokenVenues(token: string) {
  return useMutation({
    mutationFn: (venueIds: string[]) => selectTokenVenues(token, venueIds),
  });
}
