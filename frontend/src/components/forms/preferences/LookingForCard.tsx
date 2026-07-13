'use client';

import { Controller, type UseFormReturn } from 'react-hook-form';
import type { PreferencesValues } from '@/lib/validation/preferences';
import {
  GENDER_INTEREST_OPTIONS,
  HEIGHT_RANGE_OPTIONS,
} from '@/lib/constants/preferences';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { PillSelect } from '@/components/ui/PillSelect';
import { Chip } from '@/components/ui/Chip';

// HU-03 — who the match should be: gender interest, height preference, and
// whether they should be from the same university.
export function LookingForCard({
  form,
}: {
  form: UseFormReturn<PreferencesValues>;
}) {
  const { errors } = form.formState;

  return (
    <Card title="Tu match ideal" description="Cuéntanos a quién buscas.">
      <div className="space-y-6">
        <Field label="¿Qué género te interesa?" error={errors.genderInterest?.message}>
          <Controller
            control={form.control}
            name="genderInterest"
            render={({ field }) => (
              <PillSelect
                options={GENDER_INTEREST_OPTIONS}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </Field>

        <Field label="Preferencia de estatura" error={errors.heightRange?.message}>
          <Controller
            control={form.control}
            name="heightRange"
            render={({ field }) => (
              <PillSelect
                options={HEIGHT_RANGE_OPTIONS}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </Field>

        <Field
          label="¿De tu misma universidad?"
          error={errors.sameUniversity?.message}
        >
          <Controller
            control={form.control}
            name="sameUniversity"
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                <Chip
                  label="Sí"
                  selected={field.value === true}
                  onToggle={() => field.onChange(true)}
                />
                <Chip
                  label="No importa"
                  selected={field.value === false}
                  onToggle={() => field.onChange(false)}
                />
              </div>
            )}
          />
        </Field>
      </div>
    </Card>
  );
}
