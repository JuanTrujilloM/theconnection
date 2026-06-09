'use client';

import { StatusRow } from '@/components/shared/StatusRow';
import { useHealth } from '@/hooks/useHealth';
import { useUsers } from '@/hooks/useUsers';

export default function Home() {
  const { data: health, isLoading: healthLoading, isError: healthError } = useHealth();
  const { data: users, isLoading: usersLoading } = useUsers();

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-sm space-y-4 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          TheConnection
        </h1>

        <div className="space-y-2">
          <StatusRow label="Frontend" value="Next.js" status="ok" />

          <StatusRow
            label="Backend"
            value={healthLoading ? 'Conectando...' : healthError ? 'Sin conexión' : health?.service ?? ''}
            status={healthLoading ? 'loading' : healthError ? 'error' : 'ok'}
          />

          <StatusRow
            label="Base de datos"
            value={healthLoading ? 'Verificando...' : healthError ? 'Sin conexión' : health?.database ?? ''}
            status={healthLoading ? 'loading' : healthError || health?.database === 'disconnected' ? 'error' : 'ok'}
          />
        </div>

        <div>
          <h2 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Usuarios
          </h2>

          {usersLoading ? (
            <p className="text-sm text-zinc-400">Cargando...</p>
          ) : !users?.length ? (
            <p className="text-sm text-zinc-400">No hay usuarios aún</p>
          ) : (
            <ul className="space-y-2">
              {users.map((user) => (
                <li key={user.id} className="rounded-lg bg-zinc-50 px-4 py-3 dark:bg-zinc-800">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{user.email}</p>
                  <p className="text-xs text-zinc-400">{user.cellphone}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
