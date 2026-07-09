import { apiClient } from './client';
import type {
  AdminUser,
  AdminMatch,
  AdminMatchDetail,
  AdminFeedback,
  AdminReport,
} from '@/types/admin';

// Admin panel data + light-management calls. All gated server-side by the
// ADMIN_EMAILS allowlist (JwtAuthGuard + AdminGuard).

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const { data } = await apiClient.get<AdminUser[]>('/admin/users');
  return data;
}

export async function setUserStatus(
  id: string,
  status: string,
): Promise<{ id: string; status: string }> {
  const { data } = await apiClient.patch<{ id: string; status: string }>(
    `/admin/users/${id}/status`,
    { status },
  );
  return data;
}

export async function verifyUser(
  id: string,
): Promise<{ id: string; isVerified: boolean }> {
  const { data } = await apiClient.patch<{ id: string; isVerified: boolean }>(
    `/admin/users/${id}/verify`,
  );
  return data;
}

export async function fetchAdminMatches(): Promise<AdminMatch[]> {
  const { data } = await apiClient.get<AdminMatch[]>('/admin/matches');
  return data;
}

export async function fetchAdminMatch(id: string): Promise<AdminMatchDetail> {
  const { data } = await apiClient.get<AdminMatchDetail>(`/admin/matches/${id}`);
  return data;
}

export async function cancelMatch(
  id: string,
): Promise<{ id: string; status: string }> {
  const { data } = await apiClient.patch<{ id: string; status: string }>(
    `/admin/matches/${id}/cancel`,
  );
  return data;
}

export async function fetchAdminFeedback(): Promise<AdminFeedback[]> {
  const { data } = await apiClient.get<AdminFeedback[]>('/admin/feedback');
  return data;
}

export async function fetchAdminReports(): Promise<AdminReport[]> {
  const { data } = await apiClient.get<AdminReport[]>('/admin/reports');
  return data;
}
