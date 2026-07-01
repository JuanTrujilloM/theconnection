'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthGate } from '@/components/shared/AuthGate';
import { Logo } from '@/components/shared/Logo';
import { LogoutButton } from '@/components/shared/LogoutButton';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AvailabilityToggle } from '@/components/dashboard/AvailabilityToggle';
import { useMyProfile } from '@/hooks/useMyProfile';
import { useCurrentMatch } from '@/hooks/useCurrentMatch';
import {
  AVAILABILITY_STATUS,
  type AvailabilityStatus,
} from '@/lib/constants/profile';
import type { AuthUser } from '@/types/auth';

// Dashboard stub — landing spot after onboarding. The real dashboard (match of
// the week, venues, feedback) comes in a later sprint.
export default function DashboardPage() {
  return <AuthGate>{(user) => <DashboardContent user={user} />}</AuthGate>;
}

function DashboardContent({ user }: { user: AuthUser }) {
  const router = useRouter();
  const { data: profile, isLoading } = useMyProfile();
  const { data: match } = useCurrentMatch();

  // HU-06: a match awaiting place selection takes priority over the dashboard.
  useEffect(() => {
    if (match?.venueSelectionPending) router.replace('/dashboard/places');
  }, [match?.venueSelectionPending, router]);

  const status =
    (profile?.status as AvailabilityStatus | undefined) ??
    AVAILABILITY_STATUS.SEARCHING;

  return (
    <>
      <div className="flex items-center justify-between">
        <Logo />
        <LogoutButton />
      </div>

      <div className="border-white/10 bg-white/[0.04] mt-8 rounded-3xl border p-7 text-center">
        <p className="text-4xl">🎉</p>
        <h1 className="text-cream mt-4 text-2xl font-bold">
          ¡Tu perfil está listo!
        </h1>
        <p className="text-slate mt-2 text-sm">
          Bienvenido,{' '}
          <span className="text-cream font-medium">{user.email}</span>.
        </p>
        <span className="border-cyan/30 bg-cyan/10 text-cyan mt-6 inline-block rounded-full border px-4 py-1.5 text-xs font-medium">
          Próximamente: tu match semanal
        </span>
      </div>

      <div className="mt-6">
        <Card
          title="Tu disponibilidad"
          description="Pausa cuando encuentres a alguien o quieras un descanso."
        >
          {isLoading ? (
            <p className="text-slate animate-pulse text-sm">Cargando...</p>
          ) : (
            <AvailabilityToggle status={status} />
          )}
        </Card>
      </div>

      {/* Profile editing lives on its own, separate from the weekly-match flow. */}
      <div className="mt-6 flex flex-col items-center gap-3">
        <Link href="/perfil">
          <Button variant="secondary" className="px-5 py-2">
            Editar perfil
          </Button>
        </Link>
        {user.isAdmin && (
          <Link href="/admin/venues">
            <Button variant="ghost" className="px-5 py-2">
              Administrar lugares
            </Button>
          </Link>
        )}
      </div>
    </>
  );
}
