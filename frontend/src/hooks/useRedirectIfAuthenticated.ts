'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';

// Inverse of useRequireAuth: keeps already-authenticated users off the guest-only
// screens (login, register). A resolved session bounces them to the dashboard.
export function useRedirectIfAuthenticated() {
  const router = useRouter();
  const query = useCurrentUser();

  useEffect(() => {
    if (query.isSuccess) {
      router.replace('/dashboard');
    }
  }, [query.isSuccess, router]);

  return query;
}
