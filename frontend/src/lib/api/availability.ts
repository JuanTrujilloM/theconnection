import { apiClient } from './client';
import type {
  AvailabilityView,
  SlotSelection,
  TokenVenuesView,
} from '@/types/availability';

// Public token flow opened from the first WhatsApp notification (HU-09 -> HU-06).
// The token in the path is the credential, so these calls need no auth session.

export async function fetchAvailabilityView(
  token: string,
): Promise<AvailabilityView> {
  const { data } = await apiClient.get<AvailabilityView>(
    `/availability/${token}`,
  );
  return data;
}

export async function submitAvailability(
  token: string,
  slots: SlotSelection[],
): Promise<{ step: 'VENUE' }> {
  const { data } = await apiClient.post<{ step: 'VENUE' }>(
    `/availability/${token}`,
    { slots },
  );
  return data;
}

export async function fetchTokenVenues(
  token: string,
): Promise<TokenVenuesView> {
  const { data } = await apiClient.get<TokenVenuesView>(
    `/availability/${token}/venues`,
  );
  return data;
}

export async function selectTokenVenues(
  token: string,
  venueIds: string[],
): Promise<{ step: 'COMPLETED' }> {
  const { data } = await apiClient.post<{ step: 'COMPLETED' }>(
    `/availability/${token}/venues`,
    { venueIds },
  );
  return data;
}
