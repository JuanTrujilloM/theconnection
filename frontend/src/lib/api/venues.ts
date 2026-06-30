import { apiClient } from './client';
import type { Venue, VenuePayload, VenueSuggestion } from '@/types/venue';

// Admin venue management — gated server-side by the ADMIN_EMAILS allowlist.
export async function fetchVenues(): Promise<Venue[]> {
  const { data } = await apiClient.get<Venue[]>('/admin/venues');
  return data;
}

export async function createVenue(payload: VenuePayload): Promise<Venue> {
  const { data } = await apiClient.post<Venue>('/admin/venues', payload);
  return data;
}

export async function updateVenue(
  id: string,
  payload: Partial<VenuePayload>,
): Promise<Venue> {
  const { data } = await apiClient.patch<Venue>(`/admin/venues/${id}`, payload);
  return data;
}

// Soft-delete (sets active=false) so historical selections keep their FK.
export async function deactivateVenue(id: string): Promise<Venue> {
  const { data } = await apiClient.delete<Venue>(`/admin/venues/${id}`);
  return data;
}

// HU-06 — the 3 places suggested for the current match.
export async function fetchVenueSuggestions(): Promise<VenueSuggestion[]> {
  const { data } = await apiClient.get<VenueSuggestion[]>(
    '/matches/current/venue-suggestions',
  );
  return data;
}

export type VenueSelectionResult = {
  selectedVenueIds: string[];
  venueSelectionPending: boolean;
};

export async function selectVenues(
  venueIds: string[],
): Promise<VenueSelectionResult> {
  const { data } = await apiClient.post<VenueSelectionResult>(
    '/matches/current/venue-selection',
    { venueIds },
  );
  return data;
}
