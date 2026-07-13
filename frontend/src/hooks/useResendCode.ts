import { useMutation } from '@tanstack/react-query';
import { resendCode } from '@/lib/api/auth';

export function useResendCode() {
  return useMutation({ mutationFn: resendCode });
}
