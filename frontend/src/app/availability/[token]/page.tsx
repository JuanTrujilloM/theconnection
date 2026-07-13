'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PhoneShell } from '@/components/shared/PhoneShell';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/Button';
import { AvailabilityCalendar } from '@/components/availability/AvailabilityCalendar';
import { FlowState } from '@/components/availability/FlowState';
import {
  useAvailabilityView,
  useSubmitAvailability,
} from '@/hooks/useAvailabilityFlow';
import { getApiErrorMessage } from '@/lib/utils/errors';

// HU-09 — public availability picker, the LAST step of the WhatsApp token flow
// (place selection comes first). No AuthGate: the path token is the credential.
export default function AvailabilityPage() {
  const { token } = useParams<{ token: string }>();
  return (
    <PhoneShell>
      <AvailabilityContent token={token} />
    </PhoneShell>
  );
}

function AvailabilityContent({ token }: { token: string }) {
  const router = useRouter();
  const { data, isLoading, isError } = useAvailabilityView(token);
  const submit = useSubmitAvailability(token);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // A VENUE-step link hasn't chosen places yet; forward to that step first.
  useEffect(() => {
    if (data?.step === 'VENUE') router.replace(`/flow/${token}/places`);
  }, [data?.step, token, router]);

  if (isLoading) {
    return (
      <p className="text-slate animate-pulse text-sm">Cargando tu calendario...</p>
    );
  }

  // Any load error means the token is invalid/expired/used (AC #5).
  if (isError) {
    return (
      <FlowState
        emoji="🔗"
        title="Este enlace ya no es válido"
        description="El enlace expiró o ya fue usado. Espera tu próxima notificación de WhatsApp para agendar tu cita."
      />
    );
  }

  // Flow finished: just submitted, or re-opening an already-consumed link.
  if (done || data?.step === 'COMPLETED') {
    return (
      <FlowState
        emoji="✅"
        title="¡Listo!"
        description="Guardamos tus lugares y horarios. Te avisaremos por WhatsApp cuando tu match también termine, para confirmar el día, la hora y el lugar de la cita."
      />
    );
  }

  if (!data || data.step === 'VENUE') return null; // redirecting

  const toggle = (date: string, timeSlot: string) => {
    const key = `${date}|${timeSlot}`;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setFormError(null);
  };

  const onSubmit = async () => {
    // AC #3: at least one slot before saving.
    if (selected.size === 0) {
      setFormError('Selecciona al menos un horario disponible.');
      return;
    }
    const slots = [...selected].map((key) => {
      const [date, timeSlot] = key.split('|');
      return { date, timeSlot };
    });
    try {
      await submit.mutateAsync(slots);
      // Last step saved: the link is consumed and the HU-08 check runs.
      setDone(true);
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col items-center gap-4 text-center">
        <Logo />
        <div>
          <h1 className="text-cream text-2xl font-bold">¿Cuándo puedes?</h1>
          <p className="text-slate mt-1 text-sm">
            {data.partnerName
              ? `Marca tus horarios disponibles para tu cita con ${data.partnerName}.`
              : 'Marca tus horarios disponibles para tu cita.'}{' '}
            Cada horario dura 1 hora (12pm–7pm).
          </p>
        </div>
      </div>

      <AvailabilityCalendar
        days={data.days}
        timeSlots={data.timeSlots}
        selected={selected}
        onToggle={toggle}
      />

      {formError && <p className="text-blush mt-4 text-sm">{formError}</p>}

      <div className="mt-6">
        <Button
          className="w-full"
          disabled={submit.isPending}
          onClick={onSubmit}
        >
          {submit.isPending
            ? 'Guardando...'
            : `Continuar (${selected.size} ${selected.size === 1 ? 'horario' : 'horarios'})`}
        </Button>
      </div>
    </>
  );
}
