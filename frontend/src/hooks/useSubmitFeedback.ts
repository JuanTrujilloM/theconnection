import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitFeedback } from '@/lib/api/feedback';
import type { CreateFeedbackPayload } from '@/types/feedback';

// Sends HU-10 feedback. On success the pending prompt disappears and the match
// context may change, so both queries are refetched.
export function useSubmitFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFeedbackPayload) => submitFeedback(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingFeedback'] });
      queryClient.invalidateQueries({ queryKey: ['currentMatch'] });
    },
  });
}
