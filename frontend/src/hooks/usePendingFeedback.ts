import { useQuery } from '@tanstack/react-query';
import { fetchPendingFeedback } from '@/lib/api/feedback';

// Loads the past date awaiting feedback (GET /feedback/pending). Drives the
// highest-priority dashboard hero (HU-10).
export function usePendingFeedback(enabled = true) {
  return useQuery({
    queryKey: ['pendingFeedback'],
    queryFn: fetchPendingFeedback,
    enabled,
    retry: false,
  });
}
