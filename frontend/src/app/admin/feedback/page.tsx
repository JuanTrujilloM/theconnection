'use client';

import { PageHeader } from '@/components/admin/PageHeader';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Badge } from '@/components/admin/StatusBadge';
import { useAdminFeedback } from '@/hooks/useAdminData';
import { formatCOP, formatDateTime } from '@/lib/utils/format';
import type { AdminFeedback } from '@/types/admin';

export default function AdminFeedbackPage() {
  const { data, isLoading, isError } = useAdminFeedback();

  const columns: Column<AdminFeedback>[] = [
    {
      header: 'Estudiante',
      cell: (fb) => <span className="text-cream font-medium">{fb.userName}</span>,
    },
    {
      header: 'Cita',
      cell: (fb) => (
        <div>
          <span className="text-cream">{fb.venueName}</span>
          <p className="text-slate mt-0.5 text-xs">
            {formatDateTime(fb.scheduledAt)}
          </p>
        </div>
      ),
    },
    {
      header: '¿Ocurrió?',
      cell: (fb) =>
        fb.occurred ? (
          <Badge label="Sí" tone="green" />
        ) : (
          <Badge label="No asistió" tone="blush" />
        ),
    },
    {
      header: 'Rating',
      cell: (fb) =>
        fb.rating != null ? (
          <span className="text-gold" aria-label={`${fb.rating} de 5`}>
            {'★'.repeat(fb.rating)}
            <span className="text-white/15">{'★'.repeat(5 - fb.rating)}</span>
          </span>
        ) : (
          <span className="text-slate">—</span>
        ),
    },
    {
      header: 'Gasto',
      className: 'text-right',
      cell: (fb) => (
        <span className="text-cream">
          {fb.amountSpent != null ? formatCOP(fb.amountSpent) : '—'}
        </span>
      ),
    },
    {
      header: 'Comentario',
      cell: (fb) => (
        <span className="text-slate block max-w-xs truncate text-xs">
          {fb.comments ?? fb.noShowReason ?? '—'}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Feedback"
        description="Respuestas post-cita: asistencia, calificación y gasto real (HU-10)."
      />
      <DataTable
        columns={columns}
        rows={data}
        rowKey={(fb) => fb.id}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="Aún no hay feedback de citas."
      />
    </>
  );
}
