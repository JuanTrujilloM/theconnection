'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PhoneShell } from '@/components/shared/PhoneShell';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/Button';
import { VenueCard } from '@/components/places/VenueCard';
import { FlowState } from '@/components/availability/FlowState';
import {
  useSelectTokenVenues,
  useTokenVenues,
} from '@/hooks/useAvailabilityFlow';
import { getApiErrorMessage } from '@/lib/utils/errors';

// HU-06 over the same WhatsApp token — public place selection, reached after
// availability is saved (Opción A: the whole flow runs without login).
export default function TokenPlacesPage() {
  const { token } = useParams<{ token: string }>();
  return (
    <PhoneShell>
      <PlacesContent token={token} />
    </PhoneShell>
  );
}

function PlacesContent({ token }: { token: string }) {
  const router = useRouter();
  const { data, isLoading, isError } = useTokenVenues(token);
  const select = useSelectTokenVenues(token);

  const [chosen, setChosen] = useState<string[] | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Landed here without saving availability first; send them back a step.
  useEffect(() => {
    if (data?.step === 'AVAILABILITY') router.replace(`/availability/${token}`);
  }, [data?.step, token, router]);

  if (isLoading) {
    return (
      <p className="text-slate animate-pulse text-sm">
        Buscando lugares para tu cita...
      </p>
    );
  }

  if (isError) {
    return (
      <FlowState
        emoji="🔗"
        title="Este enlace ya no es válido"
        description="El enlace expiró o ya fue usado. Espera tu próxima notificación de WhatsApp."
      />
    );
  }

  if (!data || data.step === 'AVAILABILITY') return null; // redirecting

  if (saved) {
    return (
      <FlowState
        emoji="✅"
        title="¡Listo!"
        description="Guardamos tus lugares. Te avisaremos por WhatsApp cuando tu match también elija, para confirmar el sitio final de la cita."
      />
    );
  }

  const serverSelected = data.venues
    .filter((venue) => venue.selected)
    .map((venue) => venue.id);
  const selectedIds = chosen ?? serverSelected;

  const toggle = (id: string) => {
    const isSelected = selectedIds.includes(id);
    // Exactly 2 allowed: block a 3rd so both users are forced to share one.
    if (!isSelected && selectedIds.length >= data.minSelection) {
      setFormError(`Solo puedes elegir ${data.minSelection} lugares.`);
      return;
    }
    const next = isSelected
      ? selectedIds.filter((venueId) => venueId !== id)
      : [...selectedIds, id];
    setChosen(next);
    setFormError(null);
  };

  const onConfirm = async () => {
    if (selectedIds.length !== data.minSelection) {
      setFormError(`Selecciona ${data.minSelection} lugares.`);
      return;
    }
    try {
      await select.mutateAsync(selectedIds);
      setSaved(true);
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col items-center gap-4 text-center">
        <Logo />
        <div>
          <h1 className="text-cream text-2xl font-bold">Elige sus lugares</h1>
          <p className="text-slate mt-1 text-sm">
            {data.partnerName
              ? `Opciones que combinan con lo que a ti y a ${data.partnerName} les gusta.`
              : 'Opciones alineadas con sus intereses.'}{' '}
            Elige {data.minSelection} de las {data.venues.length}.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {data.venues.map((venue) => (
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
            : `Confirmar (${selectedIds.length}/${data.minSelection})`}
        </Button>
      </div>
    </>
  );
}
