'use client';

import { useCurrentUser } from '@/hooks/useCurrentUser';

// Placeholder landing after verification. The real onboarding (HU-02) lands here.
export default function OnboardingPage() {
  const { data: user, isLoading, isError } = useCurrentUser();

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-sm space-y-4 rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          ¡Cuenta verificada! 🎉
        </h1>
        {isLoading ? (
          <p className="text-sm text-zinc-400">Cargando...</p>
        ) : isError || !user ? (
          <p className="text-sm text-red-500">No pudimos cargar tu sesión.</p>
        ) : (
          <p className="text-sm text-zinc-500">
            Bienvenido,{' '}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {user.email}
            </span>
            . Pronto continuaremos con tu perfil.
          </p>
        )}
      </div>
    </div>
  );
}
