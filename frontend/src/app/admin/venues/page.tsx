'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGate } from '@/components/shared/AuthGate';
import { Button } from '@/components/ui/Button';
import { VenueForm } from '@/components/admin/VenueForm';
import { useVenues } from '@/hooks/useVenues';
import { useDeactivateVenue } from '@/hooks/useDeactivateVenue';
import type { AuthUser } from '@/types/auth';
import type { Venue } from '@/types/venue';

export default function AdminVenuesPage() {
  return <AuthGate>{(user) => <AdminVenuesContent user={user} />}</AuthGate>;
}

// 'new' opens an empty form, a Venue opens it pre-filled, null shows the list.
type Editing = Venue | 'new' | null;

function AdminVenuesContent({ user }: { user: AuthUser }) {
  const router = useRouter();

  // Allowlist gate: non-admins never see venue management.
  useEffect(() => {
    if (!user.isAdmin) router.replace('/dashboard');
  }, [user.isAdmin, router]);

  const { data: venues, isLoading } = useVenues(user.isAdmin);
  const [editing, setEditing] = useState<Editing>(null);

  if (!user.isAdmin) return null;

  if (editing) {
    return (
      <VenueForm
        venue={editing === 'new' ? undefined : editing}
        onDone={() => setEditing(null)}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-cream text-2xl font-bold">Lugares</h1>
          <p className="text-slate mt-1 text-sm">
            Administra los lugares aliados que se sugieren a las parejas.
          </p>
        </div>
        <Button className="shrink-0 px-4 py-2" onClick={() => setEditing('new')}>
          + Nuevo
        </Button>
      </div>

      {isLoading ? (
        <p className="text-slate animate-pulse text-sm">Cargando lugares...</p>
      ) : !venues || venues.length === 0 ? (
        <p className="text-slate text-sm">
          Aún no hay lugares. Crea el primero con “+ Nuevo”.
        </p>
      ) : (
        <ul className="space-y-3">
          {venues.map((venue) => (
            <VenueRow
              key={venue.id}
              venue={venue}
              onEdit={() => setEditing(venue)}
            />
          ))}
        </ul>
      )}
    </>
  );
}

function VenueRow({ venue, onEdit }: { venue: Venue; onEdit: () => void }) {
  const deactivate = useDeactivateVenue();

  return (
    <li className="border-white/10 bg-navy-soft/70 rounded-2xl border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-cream truncate font-semibold">{venue.name}</h2>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                venue.active
                  ? 'bg-cyan/15 text-cyan'
                  : 'bg-white/10 text-slate'
              }`}
            >
              {venue.active ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <p className="text-slate mt-0.5 text-xs">
            {venue.type} · ${venue.averageSpentPerPerson.toLocaleString('es-CO')}
          </p>
          {venue.tags.length > 0 && (
            <p className="text-slate/80 mt-1 truncate text-xs">
              {venue.tags.join(' · ')}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Button variant="secondary" className="px-3 py-1 text-xs" onClick={onEdit}>
            Editar
          </Button>
          {venue.active && (
            <Button
              variant="ghost"
              className="px-3 py-1 text-xs"
              disabled={deactivate.isPending}
              onClick={() => deactivate.mutate(venue.id)}
            >
              Desactivar
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}
