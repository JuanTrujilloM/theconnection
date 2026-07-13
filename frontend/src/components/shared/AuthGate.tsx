'use client';

import type { ReactNode } from 'react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import type { AuthUser } from '@/types/auth';

// Wraps protected subtrees (onboarding, dashboard). Shows a loader while the
// session resolves, renders nothing while redirecting an unauthenticated user,
// and otherwise hands the authenticated user to its children.
export function AuthGate({
  children,
}: {
  children: (user: AuthUser) => ReactNode;
}) {
  const { data: user, isLoading, isError } = useRequireAuth();

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <p className="text-slate animate-pulse text-sm">Cargando tu sesión...</p>
      </div>
    );
  }

  // useRequireAuth is redirecting to /register; render nothing in the meantime.
  if (isError || !user) return null;

  return <>{children(user)}</>;
}
