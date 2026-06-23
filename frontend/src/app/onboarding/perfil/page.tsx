'use client';

import { AuthGate } from '@/components/shared/AuthGate';
import { OnboardingShell } from '@/components/shared/OnboardingShell';
import { ProfileForm } from '@/components/forms/ProfileForm';

// HU-02 — step 1 of onboarding. AuthGate protects the route and supplies the
// authenticated user (used to auto-detect the university).
export default function ProfileOnboardingPage() {
  return (
    <AuthGate>
      {(user) => (
        <OnboardingShell
          step={1}
          total={2}
          stepLabel="Perfil personal"
          title="Cuéntanos sobre ti"
          subtitle="Esto es lo que tu match verá primero."
        >
          <ProfileForm user={user} />
        </OnboardingShell>
      )}
    </AuthGate>
  );
}
