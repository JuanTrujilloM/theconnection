'use client';

import { Controller, type UseFormReturn } from 'react-hook-form';
import type { PreferencesValues } from '@/lib/validation/preferences';
import { VIBE_OPTIONS } from '@/lib/constants/preferences';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { ChipGroup } from '@/components/ui/ChipGroup';

// HU-03 — energy/vibe (required multi-select).
export function VibeCard({ form }: { form: UseFormReturn<PreferencesValues> }) {
  const { errors } = form.formState;

  return (
    <Card title="Tu vibra" description="La energía que te define.">
      <Field label="Energía y vibra" error={errors.energyVibe?.message}>
        <Controller
          control={form.control}
          name="energyVibe"
          render={({ field }) => (
            <ChipGroup
              options={VIBE_OPTIONS}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </Field>
    </Card>
  );
}
