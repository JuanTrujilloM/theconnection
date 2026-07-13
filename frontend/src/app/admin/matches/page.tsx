'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/admin/PageHeader';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { MatchStatusBadge } from '@/components/admin/StatusBadge';
import { useAdminMatches } from '@/hooks/useAdminData';
import { useCancelMatch } from '@/hooks/useAdminActions';
import { formatDate, formatDateTime } from '@/lib/utils/format';
import type { AdminMatch } from '@/types/admin';

const FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'confirmed', label: 'Confirmados' },
  { value: 'completed', label: 'Completados' },
  { value: 'canceled', label: 'Cancelados' },
] as const;

type Filter = (typeof FILTERS)[number]['value'];

// Statuses that can still be canceled from the panel.
const CANCELABLE = new Set(['pending', 'confirmed']);

export default function AdminMatchesPage() {
  const { data, isLoading, isError } = useAdminMatches();
  const cancel = useCancelMatch();
  const [filter, setFilter] = useState<Filter>('all');

  const rows =
    filter === 'all' ? data : data?.filter((match) => match.status === filter);

  const columns: Column<AdminMatch>[] = [
    {
      header: 'Pareja',
      cell: (match) => (
        <div>
          <span className="text-cream font-medium">{match.userA.name}</span>
          <span className="text-blush mx-1.5">♥</span>
          <span className="text-cream font-medium">{match.userB.name}</span>
          <p className="text-slate mt-0.5 text-xs">
            {match.userA.university} · {match.userB.university}
          </p>
        </div>
      ),
    },
    {
      header: 'Score',
      className: 'text-right',
      cell: (match) => (
        <span className="text-cyan font-semibold">
          {match.compatibilityScore.toFixed(1)}
        </span>
      ),
    },
    {
      header: 'Estado',
      cell: (match) => <MatchStatusBadge status={match.status} />,
    },
    {
      header: 'Cita',
      cell: (match) =>
        match.date ? (
          <div>
            <span className="text-cream">{match.date.venueName}</span>
            <p className="text-slate mt-0.5 text-xs">
              {formatDateTime(match.date.scheduledAt)}
            </p>
          </div>
        ) : (
          <span className="text-slate">—</span>
        ),
    },
    {
      header: 'Creado',
      cell: (match) => (
        <span className="text-slate text-xs">{formatDate(match.createdAt)}</span>
      ),
    },
    {
      header: '',
      className: 'text-right',
      cell: (match) => (
        <div className="flex justify-end gap-3">
          <Link
            href={`/admin/matches/${match.id}`}
            className="text-cyan hover:text-cyan/80 text-xs font-medium transition"
          >
            Ver
          </Link>
          {CANCELABLE.has(match.status) && (
            <button
              onClick={() => cancel.mutate(match.id)}
              disabled={cancel.isPending}
              className="text-blush hover:text-blush/80 text-xs font-medium transition disabled:opacity-50"
            >
              Cancelar
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Matches"
        description="Todas las parejas generadas, su compatibilidad y el estado de su cita."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              filter === option.value
                ? 'bg-cyan text-navy-deep'
                : 'bg-white/5 text-slate hover:text-cream'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(match) => match.id}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No hay matches en este estado."
      />
    </>
  );
}
