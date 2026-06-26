'use client';

import { Controller, type UseFormReturn } from 'react-hook-form';
import type { PreferencesValues } from '@/lib/validation/preferences';
import { Card } from '@/components/ui/Card';
import { RangeSlider } from '@/components/ui/RangeSlider';

// HU-03 — preferred age range for the match (dual-handle slider).
export function AgeRangeCard({
  form,
  bounds,
}: {
  form: UseFormReturn<PreferencesValues>;
  bounds: { min: number; max: number };
}) {
  return (
    <Card title="Rango de edad" description="¿Qué edad buscas en tu match?">
      <Controller
        control={form.control}
        name="ageRange"
        render={({ field }) => (
          <RangeSlider
            min={bounds.min}
            max={bounds.max}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
    </Card>
  );
}
