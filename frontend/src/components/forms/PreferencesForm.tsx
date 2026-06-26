'use client';

import type { AuthUser } from '@/types/auth';
import { usePreferencesForm } from '@/hooks/usePreferencesForm';
import { Button } from '@/components/ui/Button';
import { AgeRangeCard } from './preferences/AgeRangeCard';
import { HobbiesCard } from './preferences/HobbiesCard';
import { RelationshipCard } from './preferences/RelationshipCard';
import { LookingForCard } from './preferences/LookingForCard';
import { VibeCard } from './preferences/VibeCard';

// HU-03 — interests & preferences step. Assembles the section cards; all state
// logic lives in usePreferencesForm.
export function PreferencesForm({ user }: { user: AuthUser }) {
  const { form, onSubmit, isPending, bounds } = usePreferencesForm(user);
  const rootError = form.formState.errors.root?.message;

  return (
    <form onSubmit={onSubmit} className="space-y-6 pb-28 sm:pb-6" noValidate>
      <AgeRangeCard form={form} bounds={bounds} />
      <HobbiesCard form={form} />
      <RelationshipCard form={form} />
      <LookingForCard form={form} />
      <VibeCard form={form} />

      {rootError && <p className="text-blush text-sm">{rootError}</p>}

      {/* Fixed at the bottom on mobile, inline on desktop. */}
      <div className="border-white/10 bg-navy-deep/90 fixed inset-x-0 bottom-0 border-t p-4 backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <div className="mx-auto flex max-w-2xl justify-end sm:max-w-none">
          <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
            {isPending ? 'Guardando...' : 'Listo, quiero mi match ✓'}
          </Button>
        </div>
      </div>
    </form>
  );
}
