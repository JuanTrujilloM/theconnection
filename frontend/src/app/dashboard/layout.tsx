import type { ReactNode } from 'react';
import { PhoneShell } from '@/components/shared/PhoneShell';

// Dashboard is a terminal screen, so the shell shows no back chevron.
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <PhoneShell>{children}</PhoneShell>;
}
