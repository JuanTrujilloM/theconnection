import type { ReactNode } from 'react';

// Card shell for one logical section of the onboarding forms.
export function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="border-white/10 bg-navy-soft/70 rounded-2xl border p-6 shadow-xl backdrop-blur-md sm:p-7">
      <div className="mb-5">
        <h2 className="text-cream text-lg font-semibold">{title}</h2>
        {description && <p className="text-slate mt-1 text-sm">{description}</p>}
      </div>
      {children}
    </section>
  );
}
