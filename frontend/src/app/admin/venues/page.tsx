'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/admin/PageHeader';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { Toggle } from '@/components/admin/Toggle';
import { Button } from '@/components/ui/Button';
import { VenueForm } from '@/components/admin/VenueForm';
import { useVenues } from '@/hooks/useVenues';
import { useUpdateVenue } from '@/hooks/useUpdateVenue';
import { formatCOP } from '@/lib/utils/format';
import type { Venue } from '@/types/venue';

// 'new' opens an empty form, a Venue opens it pre-filled, null closes the modal.
type Editing = Venue | 'new' | null;

export default function AdminVenuesPage() {
  const { data: venues, isLoading, isError } = useVenues();
  const update = useUpdateVenue();
  const [editing, setEditing] = useState<Editing>(null);

  // Which venue is being toggled, so only its switch shows the pending state.
  const togglingId =
    update.isPending && update.variables ? update.variables.id : null;

  const columns: Column<Venue>[] = [
    {
      header: 'Lugar',
      cell: (venue) => (
        <span className="text-cream font-medium">{venue.name}</span>
      ),
    },
    {
      header: 'Tipo',
      cell: (venue) => <span className="text-cream">{venue.type}</span>,
    },
    {
      header: 'Dirección',
      cell: (venue) => (
        <span className="text-slate block max-w-[200px] truncate text-xs">
          {venue.address}
        </span>
      ),
    },
    {
      header: 'Gasto prom.',
      className: 'text-right',
      cell: (venue) => (
        <span className="text-cream">
          {formatCOP(venue.averageSpentPerPerson)}
        </span>
      ),
    },
    {
      header: 'Comisión',
      className: 'text-right',
      cell: (venue) => (
        <span className="text-cream">
          {Math.round(venue.commissionRate * 100)}%
        </span>
      ),
    },
    {
      header: 'Etiquetas',
      cell: (venue) => (
        <span className="text-slate/80 block max-w-[12rem] truncate text-xs">
          {venue.tags.length ? venue.tags.join(' · ') : '—'}
        </span>
      ),
    },
    {
      header: 'Acciones',
      className: 'text-right',
      cell: (venue) => (
        <div className="flex items-center justify-end gap-4">
          <Toggle
            checked={venue.active}
            disabled={togglingId === venue.id}
            onChange={(next) =>
              update.mutate({ id: venue.id, payload: { active: next } })
            }
          />
          <button
            onClick={() => setEditing(venue)}
            className="text-cyan hover:text-cyan/80 text-xs font-medium whitespace-nowrap transition"
          >
            Editar
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Lugares"
        description="Lugares aliados que se sugieren a las parejas (HU-06)."
        action={
          <Button className="px-4 py-2" onClick={() => setEditing('new')}>
            + Nuevo
          </Button>
        }
      />

      <DataTable
        columns={columns}
        rows={venues}
        rowKey={(venue) => venue.id}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="Aún no hay lugares. Crea el primero con “+ Nuevo”."
      />

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:p-8"
          onClick={() => setEditing(null)}
        >
          <div
            className="w-full max-w-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <VenueForm
              venue={editing === 'new' ? undefined : editing}
              onDone={() => setEditing(null)}
              onCancel={() => setEditing(null)}
            />
          </div>
        </div>
      )}
    </>
  );
}
