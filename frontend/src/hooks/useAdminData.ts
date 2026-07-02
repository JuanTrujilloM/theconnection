import { useQuery } from '@tanstack/react-query';
import {
  fetchAdminUsers,
  fetchAdminMatches,
  fetchAdminMatch,
  fetchAdminFeedback,
  fetchAdminReports,
} from '@/lib/api/admin';

// Read hooks for the admin panel lists. `enabled` lets a page skip the call for
// non-admins before the redirect kicks in.

export function useAdminUsers(enabled = true) {
  return useQuery({
    queryKey: ['adminUsers'],
    queryFn: fetchAdminUsers,
    enabled,
    retry: false,
  });
}

export function useAdminMatches(enabled = true) {
  return useQuery({
    queryKey: ['adminMatches'],
    queryFn: fetchAdminMatches,
    enabled,
    retry: false,
  });
}

export function useAdminMatch(id: string) {
  return useQuery({
    queryKey: ['adminMatch', id],
    queryFn: () => fetchAdminMatch(id),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useAdminFeedback(enabled = true) {
  return useQuery({
    queryKey: ['adminFeedback'],
    queryFn: fetchAdminFeedback,
    enabled,
    retry: false,
  });
}

export function useAdminReports(enabled = true) {
  return useQuery({
    queryKey: ['adminReports'],
    queryFn: fetchAdminReports,
    enabled,
    retry: false,
  });
}
