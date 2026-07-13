import { useMutation } from '@tanstack/react-query';
import { createProfile } from '@/lib/api/profile';

export function useCreateProfile() {
  return useMutation({ mutationFn: createProfile });
}
