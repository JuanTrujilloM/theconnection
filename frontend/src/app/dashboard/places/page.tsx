'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGate } from '@/components/shared/AuthGate';
import { Button } from '@/components/ui/Button';
import { VenueCard } from '@/components/places/VenueCard';
import { useVenueSuggestions } from '@/hooks/useVenueSuggestions';
import { useSelectVenues } from '@/hooks/useSelectVenues';
import { getApiErrorMessage } from '@/lib/utils/errors';
import { MIN_VENUE_SELECTION } from '@/lib/constants/venues';

export default function PlacesPage() {
  return <AuthGate>{() => <PlacesContent />}</AuthGate>;
}

function PlacesContent() {
  const router = useRouter();
  const { data: suggestions, isLoading, isError, error } =
    useVenueSuggestions();
  const select = useSelectVenues();

  // null until the user touches anything, then the live selection. Initial state
  // comes from whatever the server already has stored for this user.
  const [chosen, setChosen] = useState<string[] | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (isLoading) {
    return (
      <p className="text-slate animate-pulse text-sm">
        Buscando lugares para tu cita...
      </p>
    );
  }

  if (isError || !suggestions) {
    return (
      <div className="text-center">
        <p className="text-slate text-sm">
          {getApiErrorMessage(error, 'No pudimos cargar las sugerencias.')}
        </p>
        <Button
          variant="secondary"
          className="mt-4 px-5 py-2"
          onClick={() => router.replace('/dashboard')}
        >
          Volver al inicio
        </Button>
      </div>
    );
  }

  const serverSelected = suggestions
    .filter((venue) => venue.selected)
    .map((venue) => venue.id);
  const selectedIds = chosen ?? serverSelected;

  const toggle = (id: string) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((venueId) => venueId !== id)
      : [...selectedIds, id];
    setChosen(next);
    setFormError(null);
  };

  const onConfirm = async () => {
    if (selectedIds.length < MIN_VENUE_SELECTION) {
      setFormError(`Selecciona al menos ${MIN_VENUE_SELECTION} lugares.`);
      return;
    }
    try {
      await select.mutateAsync(selectedIds);
      setSaved(true);
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    }
  };

  if (saved) {
    return (
      <div className="border-white/10 bg-white/[0.04] rounded-3xl border p-7 text-center">
        <p className="text-4xl">✅</p>
        <h1 className="text-cream mt-4 text-2xl font-bold">¡Listo!</h1>
        <p className="text-slate mt-2 text-sm">
          Guardamos tus lugares. Esperaremos la elección de tu match para
          confirmar el sitio final de la cita.
        </p>
        <Button
          className="mt-6 px-5 py-2"
          onClick={() => router.replace('/dashboard')}
        >
          Volver al inicio
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-cream text-2xl font-bold">Elige sus lugares</h1>
        <p className="text-slate mt-1 text-sm">
          Estas opciones combinan con sus intereses. Selecciona al menos{' '}
          {MIN_VENUE_SELECTION} para continuar.
        </p>
      </div>

      <div className="space-y-3">
        {suggestions.map((venue) => (
          <VenueCard
            key={venue.id}
            venue={venue}
            selected={selectedIds.includes(venue.id)}
            onToggle={() => toggle(venue.id)}
          />
        ))}
      </div>

      {formError && <p className="text-blush mt-4 text-sm">{formError}</p>}

      <div className="mt-6">
        <Button
          className="w-full"
          disabled={select.isPending}
          onClick={onConfirm}
        >
          {select.isPending
            ? 'Guardando...'
            : `Confirmar (${selectedIds.length}/${suggestions.length})`}
        </Button>
      </div>
    </>
  );
}
