import { apiClient } from './client';
import type { Venue, VenuePayload } from '@/types/venue';

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

// HU-06 suggestion/selection calls live in lib/api/availability.ts — venue
// selection runs only in the public tokenized flow.
