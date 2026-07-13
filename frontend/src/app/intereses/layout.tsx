import type { ReactNode } from 'react';
import { PhoneShell } from '@/components/shared/PhoneShell';

// Edit-interests screen returns to the dashboard via the shell back chevron.
export default function EditInterestsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <PhoneShell backHref="/dashboard">{children}</PhoneShell>;
}
