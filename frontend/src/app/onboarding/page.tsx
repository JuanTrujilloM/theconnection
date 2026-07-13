import { redirect } from 'next/navigation';

// Onboarding entry point. The flow starts at the personal profile step (HU-02).
export default function OnboardingPage() {
  redirect('/onboarding/perfil');
}
