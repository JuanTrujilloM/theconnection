'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';

// AUTH: using existing useCurrentUser (GET /auth/me via the cookie session).
// Guards client routes: unauthenticated users (me() rejects after the refresh
// interceptor gives up) are bounced to the registration/login entry point.
export function useRequireAuth() {
  const router = useRouter();
  const query = useCurrentUser();

  useEffect(() => {
    if (query.isError) {
      // No real login screen yet; /register is the auth entry point.
      router.replace('/register');
    }
  }, [query.isError, router]);

  return query;
}
