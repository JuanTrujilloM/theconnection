import type { ReactNode } from 'react';
import { PhoneShell } from '@/components/shared/PhoneShell';
import { Logo } from '@/components/shared/Logo';

// Shared chrome for the auth screens (login, register, verify): phone shell with
// a back-to-home chevron and a centered wordmark above each page's content.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <PhoneShell backHref="/" center>
      <div className="flex flex-col items-center gap-8">
        <Logo />
        <div className="w-full space-y-6">{children}</div>
      </div>
    </PhoneShell>
  );
}
