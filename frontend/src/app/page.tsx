'use client';

import { useHealth } from '@/hooks/useHealth';

export default function Home() {
  const { data, isLoading, isError, dataUpdatedAt } = useHealth();

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          TheConnection
        </h1>

        <div className="space-y-4">
          <StatusRow label="Frontend" value="Next.js" status="ok" />

          <StatusRow
            label="Backend"
            value={
              isLoading
                ? 'Conectando...'
                : isError
                  ? 'Sin conexión'
                  : data?.service ?? ''
            }
            status={isLoading ? 'loading' : isError ? 'error' : 'ok'}
          />
        </div>

        {data && (
          <p className="mt-6 text-xs text-zinc-400">
            Última respuesta:{' '}
            {new Date(dataUpdatedAt).toLocaleTimeString('es-CO')}
          </p>
        )}
      </div>
    </div>
  );
}

function StatusRow({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: 'ok' | 'error' | 'loading';
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-zinc-50 px-4 py-3 dark:bg-zinc-800">
      <span className="text-sm text-zinc-600 dark:text-zinc-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {value}
        </span>
        <span
          className={`h-2 w-2 rounded-full ${
            status === 'ok'
              ? 'bg-green-500'
              : status === 'error'
                ? 'bg-red-500'
                : 'animate-pulse bg-yellow-400'
          }`}
        />
      </div>
    </div>
  );
}
