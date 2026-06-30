'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { venueSchema, type VenueValues } from '@/lib/validation/venue';
import { VENUE_TYPES } from '@/lib/constants/venues';
import { useCreateVenue } from '@/hooks/useCreateVenue';
import { useUpdateVenue } from '@/hooks/useUpdateVenue';
import { getApiErrorMessage } from '@/lib/utils/errors';
import type { Venue } from '@/types/venue';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { TagInput } from '@/components/ui/TagInput';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';

// Create/edit a partner venue. `venue` switches the form into edit mode.
export function VenueForm({
  venue,
  onDone,
  onCancel,
}: {
  venue?: Venue;
  onDone: () => void;
  onCancel: () => void;
}) {
  const create = useCreateVenue();
  const update = useUpdateVenue();

  const form = useForm<VenueValues>({
    resolver: zodResolver(venueSchema),
    defaultValues: venue
      ? {
          name: venue.name,
          type: venue.type as VenueValues['type'],
          address: venue.address,
          openingHours: venue.openingHours,
          description: venue.description,
          commissionRate: venue.commissionRate,
          averageSpentPerPerson: venue.averageSpentPerPerson,
          tags: venue.tags,
          active: venue.active,
        }
      : {
          name: '',
          type: 'Café',
          address: '',
          openingHours: '',
          description: '',
          commissionRate: 0.1,
          averageSpentPerPerson: 0,
          tags: [],
          active: true,
        },
  });
  const { errors } = form.formState;
  const pending = create.isPending || update.isPending;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (venue) await update.mutateAsync({ id: venue.id, payload: values });
      else await create.mutateAsync(values);
      onDone();
    } catch (error) {
      form.setError('root', { message: getApiErrorMessage(error) });
    }
  });

  return (
    <Card
      title={venue ? 'Editar lugar' : 'Nuevo lugar'}
      description="Los lugares activos alimentan las sugerencias de los estudiantes."
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field label="Nombre" error={errors.name?.message}>
          <Input hasError={Boolean(errors.name)} {...form.register('name')} />
        </Field>

        <Field label="Tipo" error={errors.type?.message}>
          <Select hasError={Boolean(errors.type)} {...form.register('type')}>
            {VENUE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Dirección" error={errors.address?.message}>
          <Input
            hasError={Boolean(errors.address)}
            {...form.register('address')}
          />
        </Field>

        <Field label="Horario" error={errors.openingHours?.message}>
          <Input
            placeholder="Lun-Dom 8:00-22:00"
            hasError={Boolean(errors.openingHours)}
            {...form.register('openingHours')}
          />
        </Field>

        <Field label="Descripción" error={errors.description?.message}>
          <Textarea
            rows={3}
            hasError={Boolean(errors.description)}
            {...form.register('description')}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Comisión (0–1)" error={errors.commissionRate?.message}>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="1"
              hasError={Boolean(errors.commissionRate)}
              {...form.register('commissionRate', { valueAsNumber: true })}
            />
          </Field>
          <Field
            label="Gasto prom. (COP)"
            error={errors.averageSpentPerPerson?.message}
          >
            <Input
              type="number"
              step="1000"
              min="0"
              hasError={Boolean(errors.averageSpentPerPerson)}
              {...form.register('averageSpentPerPerson', {
                valueAsNumber: true,
              })}
            />
          </Field>
        </div>

        <Field label="Etiquetas de interés" error={errors.tags?.message}>
          <Controller
            control={form.control}
            name="tags"
            render={({ field }) => (
              <TagInput
                value={field.value}
                onChange={field.onChange}
                placeholder="café, cine, naturaleza..."
              />
            )}
          />
        </Field>

        <Controller
          control={form.control}
          name="active"
          render={({ field }) => (
            <Chip
              label={field.value ? 'Activo' : 'Inactivo'}
              selected={field.value}
              onToggle={() => field.onChange(!field.value)}
            />
          )}
        />

        {errors.root && (
          <p className="text-blush text-sm">{errors.root.message}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={pending}>
            {pending ? 'Guardando...' : venue ? 'Guardar' : 'Crear'}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
}
