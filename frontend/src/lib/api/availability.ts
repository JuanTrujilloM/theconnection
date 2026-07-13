import { apiClient } from './client';
import type {
  AvailabilityView,
  SlotSelection,
  TokenVenuesView,
} from '@/types/availability';

// Public token flow opened from the first WhatsApp notification (HU-06 places
// first, then HU-09 availability). The token in the path is the credential, so
// these calls need no auth session.

export async function fetchAvailabilityView(
  token: string,
): Promise<AvailabilityView> {
  const { data } = await apiClient.get<AvailabilityView>(
    `/availability/${token}`,
  );
  return data;
}

// Last step of the flow: consumes the link and triggers the HU-08 check.
export async function submitAvailability(
  token: string,
  slots: SlotSelection[],
): Promise<{ step: 'COMPLETED' }> {
  const { data } = await apiClient.post<{ step: 'COMPLETED' }>(
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

// Step 1 of the flow: saving places advances the link to time selection.
export async function selectTokenVenues(
  token: string,
  venueIds: string[],
): Promise<{ step: 'AVAILABILITY' }> {
  const { data } = await apiClient.post<{ step: 'AVAILABILITY' }>(
    `/availability/${token}/venues`,
    { venueIds },
  );
  return data;
}
