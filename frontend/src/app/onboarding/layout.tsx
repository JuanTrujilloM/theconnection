import type { ReactNode } from 'react';
import { PhoneShell } from '@/components/shared/PhoneShell';

// Onboarding surface. The phone shell supplies the backdrop and step-to-step
// back navigation; auth protection is applied per step via AuthGate so each
// page can hand the authenticated user to its form.
export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <PhoneShell back>{children}</PhoneShell>;
}
