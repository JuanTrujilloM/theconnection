import { useQuery } from '@tanstack/react-query';
import { fetchMyProfile } from '@/lib/api/profile';

// Loads the saved profile to pre-fill the edit form (GET /profile/me).
export function useMyProfile(enabled = true) {
  return useQuery({
    queryKey: ['myProfile'],
    queryFn: fetchMyProfile,
    enabled,
    retry: false,
  });
}
