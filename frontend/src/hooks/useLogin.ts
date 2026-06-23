import { useMutation } from '@tanstack/react-query';
import { requestLoginCode } from '@/lib/api/auth';

export function useLogin() {
  return useMutation({ mutationFn: requestLoginCode });
}
