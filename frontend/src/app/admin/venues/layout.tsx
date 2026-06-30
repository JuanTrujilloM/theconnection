import type { ReactNode } from 'react';
import { PhoneShell } from '@/components/shared/PhoneShell';

// Admin venue management returns to the dashboard via the shell back chevron.
export default function AdminVenuesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <PhoneShell backHref="/dashboard">{children}</PhoneShell>;
}
