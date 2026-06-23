'use client';

import { Controller, type UseFormReturn } from 'react-hook-form';
import type { ProfileValues } from '@/lib/validation/profile';
import { AVAILABILITY_OPTIONS } from '@/lib/constants/profile';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { ChipGroup } from '@/components/ui/ChipGroup';

// HU-09 onboarding step — when the user is generally free to meet.
export function AvailabilityCard({
  form,
}: {
  form: UseFormReturn<ProfileValues>;
}) {
  const error = form.formState.errors.availability?.message;

  return (
    <Card
      title="Disponibilidad"
      description="¿En qué franjas sueles estar libre para una cita?"
    >
      <Field label="Franjas horarias" error={error}>
        <Controller
          control={form.control}
          name="availability"
          render={({ field }) => (
            <ChipGroup
              options={AVAILABILITY_OPTIONS}
              value={field.value}
              onChange={(next) =>
                field.onChange(next as ProfileValues['availability'])
              }
            />
          )}
        />
      </Field>
    </Card>
  );
}
