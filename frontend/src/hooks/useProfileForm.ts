'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { profileSchema, type ProfileValues } from '@/lib/validation/profile';
import { universityFromEmail } from '@/lib/utils/university';
import { useCreateProfile } from '@/hooks/useCreateProfile';
import { useMyProfile } from '@/hooks/useMyProfile';
import { getApiErrorMessage } from '@/lib/utils/errors';
import type { AuthUser } from '@/types/auth';
import type { ProfileResponse } from '@/types/profile';

// State logic for the personal profile form (HU-02). Works in two modes:
// - create (onboarding): blank form, on save advances to the preferences step.
// - edit: pre-filled from GET /profile/me, on save returns to the dashboard.
export function useProfileForm(user: AuthUser, edit = false) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const university = universityFromEmail(user.email);
  const { mutateAsync, isPending } = useCreateProfile();

  // Only fetch the saved profile when editing.
  const { data: profile, isLoading: isLoadingProfile } = useMyProfile(edit);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      dateOfBirth: '',
      gender: undefined,
      height: undefined,
      photos: [],
      biography: '',
      major: '',
      semester: undefined,
      availability: [],
    },
  });

  // In create mode, returning onboarded users skip straight to the dashboard.
  useEffect(() => {
    if (!edit && user.onboardingCompleted) router.replace('/dashboard');
  }, [edit, user.onboardingCompleted, router]);

  // In edit mode, hydrate the form once the saved profile loads.
  const { reset } = form;
  useEffect(() => {
    if (edit && profile) reset(toFormValues(profile));
  }, [edit, profile, reset]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      // University is derived server-side from the email; not sent.
      await mutateAsync(buildProfileFormData(values));
      if (edit) {
        // Refresh the cached profile so a later edit shows the new values.
        queryClient.invalidateQueries({ queryKey: ['myProfile'] });
        router.push('/dashboard');
      } else {
        router.push('/onboarding/intereses');
      }
    } catch (error) {
      form.setError('root', { message: getApiErrorMessage(error) });
    }
  });

  return { form, university, onSubmit, isPending, isLoadingProfile };
}

// Maps a saved profile into form values; primary photo first, dates to yyyy-mm-dd.
function toFormValues(profile: ProfileResponse): ProfileValues {
  const photos = [...profile.photos]
    .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))
    .map((photo) => ({ id: photo.id, url: photo.url }));

  return {
    name: profile.name,
    dateOfBirth: profile.dateOfBirth.slice(0, 10),
    // Server values were validated on save; narrow them back to the form unions.
    gender: profile.gender as ProfileValues['gender'],
    height: profile.height,
    photos,
    biography: profile.biography,
    major: profile.major,
    semester: profile.semester as ProfileValues['semester'],
    // availability is stored comma-joined; split it back into the chip array.
    availability: profile.availability
      ? (profile.availability.split(', ') as ProfileValues['availability'])
      : [],
  };
}

// Profile fields + photos as multipart/form-data for POST /profile. The manifest
// preserves order and tells the backend which photos to keep vs upload.
function buildProfileFormData(values: ProfileValues): FormData {
  const data = new FormData();
  data.append('name', values.name);
  data.append('dateOfBirth', values.dateOfBirth);
  data.append('gender', values.gender);
  data.append('height', String(values.height));
  data.append('biography', values.biography);
  data.append('major', values.major);
  data.append('semester', values.semester);
  data.append('availability', values.availability.join(', '));

  const manifest = values.photos.map((photo) => {
    if (photo.file) {
      data.append('photos', photo.file);
      return 'new';
    }
    return `keep:${photo.url}`;
  });
  data.append('photoManifest', JSON.stringify(manifest));

  return data;
}
