'use client';

import { PageHeader } from '@/components/admin/PageHeader';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { useAdminReports } from '@/hooks/useAdminData';
import { formatDate } from '@/lib/utils/format';
import type { AdminReport } from '@/types/admin';

export default function AdminReportsPage() {
  const { data, isLoading, isError } = useAdminReports();

  const columns: Column<AdminReport>[] = [
    {
      header: 'Reporta',
      cell: (report) => (
        <div>
          <span className="text-cream font-medium">{report.reporter.name}</span>
          <p className="text-slate mt-0.5 text-xs">
            {report.reporter.university}
          </p>
        </div>
      ),
    },
    {
      header: 'Reportado',
      cell: (report) => (
        <div>
          <span className="text-cream font-medium">{report.reported.name}</span>
          <p className="text-slate mt-0.5 text-xs">
            {report.reported.university}
          </p>
        </div>
      ),
    },
    {
      header: 'Fecha',
      className: 'text-right',
      cell: (report) => (
        <span className="text-slate text-xs">
          {formatDate(report.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Reportes"
        description="Cola de moderación: reportes de seguridad entre usuarios."
      />
      <DataTable
        columns={columns}
        rows={data}
        rowKey={(report) => report.id}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No hay reportes. Todo en orden."
      />
    </>
  );
}
