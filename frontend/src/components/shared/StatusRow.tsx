export function StatusRow({
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
