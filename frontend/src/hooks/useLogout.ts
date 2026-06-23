import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/api/auth';

// Ends the session (backend clears the auth cookies + revokes the refresh token),
// drops the cached user, and returns to the public homepage.
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Set to null (not remove) so AuthGate doesn't refetch and 401 mid-redirect.
      queryClient.setQueryData(['currentUser'], null);
      router.replace('/');
    },
  });
}
