'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import type { AuthUser } from '@/types/auth';

// Gates the whole /admin section: unauthenticated users bounce to /register
// (via useRequireAuth), authenticated non-admins bounce to /dashboard, and only
// allowlisted admins reach the panel.
export function AdminGate({
  children,
}: {
  children: (user: AuthUser) => ReactNode;
}) {
  const router = useRouter();
  const { data: user, isLoading, isError } = useRequireAuth();

  useEffect(() => {
    if (user && !user.isAdmin) router.replace('/dashboard');
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate animate-pulse text-sm">Cargando panel...</p>
      </div>
    );
  }

  // Redirecting (unauthenticated, or authenticated-but-not-admin): render nothing.
  if (isError || !user || !user.isAdmin) return null;

  return <>{children(user)}</>;
}
