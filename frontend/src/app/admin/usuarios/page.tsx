'use client';

import { PageHeader } from '@/components/admin/PageHeader';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Badge, UserStatusBadge } from '@/components/admin/StatusBadge';
import { useAdminUsers } from '@/hooks/useAdminData';
import { useSetUserStatus, useVerifyUser } from '@/hooks/useAdminActions';
import { formatDate } from '@/lib/utils/format';
import type { AdminUser } from '@/types/admin';

export default function AdminUsersPage() {
  const { data, isLoading, isError } = useAdminUsers();
  const setStatus = useSetUserStatus();
  const verify = useVerifyUser();

  const columns: Column<AdminUser>[] = [
    {
      header: 'Estudiante',
      cell: (user) => (
        <div>
          <span className="text-cream font-medium">
            {user.profile?.name ?? '—'}
          </span>
          <p className="text-slate mt-0.5 text-xs">{user.email}</p>
        </div>
      ),
    },
    {
      header: 'Universidad',
      cell: (user) =>
        user.profile ? (
          <div>
            <span className="text-cream">{user.profile.university}</span>
            <p className="text-slate mt-0.5 text-xs">
              {user.profile.major} · sem {user.profile.semester}
            </p>
          </div>
        ) : (
          <span className="text-slate text-xs">Sin perfil</span>
        ),
    },
    {
      header: 'Edad',
      cell: (user) => (
        <span className="text-cream">{user.profile?.age ?? '—'}</span>
      ),
    },
    {
      header: 'Matches',
      className: 'text-right',
      cell: (user) => <span className="text-cream">{user.matchCount}</span>,
    },
    {
      header: 'Estado',
      cell: (user) => (
        <div className="flex flex-wrap gap-1.5">
          {user.profile ? (
            <UserStatusBadge status={user.profile.status} />
          ) : null}
          {user.isVerified ? (
            <Badge label="Verificado" tone="green" />
          ) : (
            <Badge label="Sin verificar" tone="gold" />
          )}
        </div>
      ),
    },
    {
      header: 'Registro',
      cell: (user) => (
        <span className="text-slate text-xs">{formatDate(user.createdAt)}</span>
      ),
    },
    {
      header: '',
      className: 'text-right',
      cell: (user) => (
        <div className="flex justify-end gap-3">
          {user.profile ? (
            <button
              onClick={() =>
                setStatus.mutate({
                  id: user.id,
                  status:
                    user.profile!.status === 'SEARCHING'
                      ? 'PAUSED'
                      : 'SEARCHING',
                })
              }
              disabled={setStatus.isPending}
              className="text-slate hover:text-cream text-xs font-medium transition disabled:opacity-50"
            >
              {user.profile.status === 'SEARCHING' ? 'Pausar' : 'Reanudar'}
            </button>
          ) : null}
          {!user.isVerified ? (
            <button
              onClick={() => verify.mutate(user.id)}
              disabled={verify.isPending}
              className="text-cyan hover:text-cyan/80 text-xs font-medium transition disabled:opacity-50"
            >
              Verificar
            </button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Estudiantes registrados, su perfil y estado de matching."
      />
      <DataTable
        columns={columns}
        rows={data}
        rowKey={(user) => user.id}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="Aún no hay usuarios registrados."
      />
    </>
  );
}
