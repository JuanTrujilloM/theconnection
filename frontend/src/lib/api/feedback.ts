import { apiClient } from './client';
import type { CreateFeedbackPayload, PendingFeedback } from '@/types/feedback';

// HU-10 — the past date awaiting this user's feedback, or null.
export async function fetchPendingFeedback(): Promise<PendingFeedback | null> {
  const { data } = await apiClient.get<PendingFeedback | null>(
    '/feedback/pending',
  );
  return data;
}

export async function submitFeedback(
  payload: CreateFeedbackPayload,
): Promise<void> {
  await apiClient.post('/feedback', payload);
}
