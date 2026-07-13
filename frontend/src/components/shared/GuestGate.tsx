'use client';

import type { ReactNode } from 'react';
import { useRedirectIfAuthenticated } from '@/hooks/useRedirectIfAuthenticated';

// Wraps guest-only screens (login, register). Shows a loader while the session
// resolves, renders nothing while redirecting an authenticated user to the
// dashboard, and otherwise shows the guest content.
export function GuestGate({ children }: { children: ReactNode }) {
  const { isLoading, isSuccess } = useRedirectIfAuthenticated();

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <p className="text-slate animate-pulse text-sm">Cargando...</p>
      </div>
    );
  }

  // useRedirectIfAuthenticated is sending the user to /dashboard; render nothing.
  if (isSuccess) return null;

  return <>{children}</>;
}
