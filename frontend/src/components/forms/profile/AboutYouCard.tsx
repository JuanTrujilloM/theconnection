'use client';

import type { UseFormReturn } from 'react-hook-form';
import type { ProfileValues } from '@/lib/validation/profile';
import { MAX_BIO_LENGTH } from '@/lib/constants/profile';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Textarea } from '@/components/ui/Textarea';

// HU-02 — biography with a live character counter.
export function AboutYouCard({ form }: { form: UseFormReturn<ProfileValues> }) {
  const { register, watch, formState } = form;
  const { errors } = formState;

  const bioLength = watch('biography')?.length ?? 0;

  return (
    <Card title="Sobre ti" description="Deja que tu match te conozca.">
      <Field label="Biografía" htmlFor="biography" error={errors.biography?.message}>
        <Textarea
          id="biography"
          rows={3}
          maxLength={MAX_BIO_LENGTH}
          placeholder="Apasionado por el café de especialidad y los planes al aire libre."
          hasError={!!errors.biography}
          {...register('biography')}
        />
        <p className="text-slate text-right text-xs">
          {bioLength}/{MAX_BIO_LENGTH}
        </p>
      </Field>
    </Card>
  );
}
