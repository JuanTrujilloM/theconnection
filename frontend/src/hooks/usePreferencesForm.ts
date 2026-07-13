'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  preferencesSchema,
  type PreferencesValues,
} from '@/lib/validation/preferences';
import { AGE_BOUNDS } from '@/lib/constants/preferences';
import { useCreatePreferences } from '@/hooks/useCreatePreferences';
import { useMyPreferences } from '@/hooks/useMyPreferences';
import { getApiErrorMessage } from '@/lib/utils/errors';
import type { AuthUser } from '@/types/auth';
import type { PreferencesResponse } from '@/types/preferences';

// State logic for the interests & preferences form (HU-03). Works in two modes:
// - create (onboarding): blank form; saving marks onboarding complete server-side.
// - edit: pre-filled from GET /preferences/me, on save returns to the dashboard.
// Both modes POST /preferences — the backend upserts.
export function usePreferencesForm(user: AuthUser, edit = false) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useCreatePreferences();

  // Only fetch the saved preferences when editing.
  const { data: preferences, isLoading: isLoadingPreferences } =
    useMyPreferences(edit);

  const form = useForm<PreferencesValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      ageRange: { min: 20, max: 28 },
      hobbies: [],
      relationshipType: undefined,
      orientation: undefined,
      genderInterest: undefined,
      sameUniversity: undefined,
      heightRange: undefined,
      energyVibe: [],
    },
  });

  // In create mode, returning onboarded users skip straight to the dashboard.
  useEffect(() => {
    if (!edit && user.onboardingCompleted) router.replace('/dashboard');
  }, [edit, user.onboardingCompleted, router]);

  // In edit mode, hydrate the form once the saved preferences load.
  const { reset } = form;
  useEffect(() => {
    if (edit && preferences) reset(toFormValues(preferences));
  }, [edit, preferences, reset]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await mutateAsync(values);
      if (edit) {
        // Refresh the cache so a later edit shows the new values.
        queryClient.invalidateQueries({ queryKey: ['myPreferences'] });
      }
      router.push('/dashboard');
    } catch (error) {
      form.setError('root', { message: getApiErrorMessage(error) });
    }
  });

  return { form, onSubmit, isPending, isLoadingPreferences, bounds: AGE_BOUNDS };
}

// Maps saved preferences into form values: flat minAge/maxAge back to the nested
// range, comma-joined energyVibe back to a list.
function toFormValues(preferences: PreferencesResponse): PreferencesValues {
  return {
    ageRange: { min: preferences.minAge, max: preferences.maxAge },
    hobbies: preferences.hobbies,
    // Server values were validated on save; narrow them back to the form unions.
    relationshipType:
      preferences.relationshipType as PreferencesValues['relationshipType'],
    orientation: preferences.orientation as PreferencesValues['orientation'],
    genderInterest:
      preferences.genderInterest as PreferencesValues['genderInterest'],
    sameUniversity: preferences.sameUniversity,
    heightRange: preferences.heightRange as PreferencesValues['heightRange'],
    energyVibe: preferences.energyVibe
      .split(',')
      .map((vibe) => vibe.trim())
      .filter(Boolean),
  };
}
