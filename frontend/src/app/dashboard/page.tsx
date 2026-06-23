'use client';

import Link from 'next/link';
import { AuthGate } from '@/components/shared/AuthGate';
import { Logo } from '@/components/shared/Logo';
import { LogoutButton } from '@/components/shared/LogoutButton';
import { Button } from '@/components/ui/Button';

// Dashboard stub — landing spot after onboarding. The real dashboard (match of
// the week, venues, feedback) comes in a later sprint.
export default function DashboardPage() {
  return (
    <AuthGate>
      {(user) => (
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
              <span className="text-cream font-medium">{user.email}</span>. Cada
              domingo a las 7pm la IA buscará tu match de la semana.
            </p>
            <span className="border-cyan/30 bg-cyan/10 text-cyan mt-6 inline-block rounded-full border px-4 py-1.5 text-xs font-medium">
              Próximamente: tu match semanal
            </span>
            <div className="mt-6">
              <Link href="/perfil">
                <Button variant="secondary" className="px-5 py-2">
                  Editar perfil
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </AuthGate>
  );
}
