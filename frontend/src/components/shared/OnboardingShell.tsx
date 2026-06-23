import type { ReactNode } from 'react';
import { Logo } from '@/components/shared/Logo';
import { ProgressSteps } from '@/components/ui/ProgressSteps';

// Step chrome rendered inside the phone shell: brand header, progress bar and
// title. The shell owns the backdrop and width, so this stays layout-light.
export function OnboardingShell({
  step,
  total,
  stepLabel,
  title,
  subtitle,
  children,
}: {
  step: number;
  total: number;
  stepLabel: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-6 flex justify-center">
        <Logo />
      </div>

      <ProgressSteps current={step} total={total} label={stepLabel} />

      <div className="mt-6 mb-6 text-center">
        <h1 className="text-cream text-2xl font-bold">{title}</h1>
        <p className="text-slate mt-1 text-sm">{subtitle}</p>
      </div>

      {children}
    </div>
  );
}
