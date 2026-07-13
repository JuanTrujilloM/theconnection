import { apiClient } from './client';
import type { AuthUser, RegisterPayload, VerifyPayload } from '@/types/auth';

export async function register(
  payload: RegisterPayload,
): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>(
    '/auth/register',
    payload,
  );
  return data;
}

// Passwordless login: requests a verification code for an existing account.
export async function requestLoginCode(
  email: string,
): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>('/auth/login', {
    email,
  });
  return data;
}

export async function verifyCode(payload: VerifyPayload): Promise<AuthUser> {
  const { data } = await apiClient.post<{ user: AuthUser }>(
    '/auth/verify',
    payload,
  );
  return data.user;
}

export async function resendCode(email: string): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>('/auth/resend', {
    email,
  });
  return data;
}

export async function fetchMe(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>('/auth/me');
  return data;
}

export async function logout(): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>('/auth/logout');
  return data;
}
