'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  preferencesSchema,
  type PreferencesValues,
} from '@/lib/validation/preferences';
import { AGE_BOUNDS } from '@/lib/constants/preferences';
import { useCreatePreferences } from '@/hooks/useCreatePreferences';
import { getApiErrorMessage } from '@/lib/utils/errors';
import type { AuthUser } from '@/types/auth';

// State logic for the interests & preferences step (HU-03). On valid submit it
// persists preferences (POST /preferences) — which marks onboarding complete
// server-side — then sends the user to the dashboard.
export function usePreferencesForm(user: AuthUser) {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreatePreferences();

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

  // Returning users who already finished onboarding skip straight to the dashboard.
  useEffect(() => {
    if (user.onboardingCompleted) router.replace('/dashboard');
  }, [user.onboardingCompleted, router]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await mutateAsync(values);
      router.push('/dashboard');
    } catch (error) {
      form.setError('root', { message: getApiErrorMessage(error) });
    }
  });

  return { form, onSubmit, isPending, bounds: AGE_BOUNDS };
}
