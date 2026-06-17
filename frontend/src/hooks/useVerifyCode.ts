import { useMutation, useQueryClient } from '@tanstack/react-query';
import { verifyCode } from '@/lib/api/auth';

export function useVerifyCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyCode,
    onSuccess: (user) => {
      // Seed the current-user cache so the next screen has it immediately.
      queryClient.setQueryData(['currentUser'], user);
    },
  });
}
