import type { ReactNode } from 'react';

// Centered status card for the public flow: loading, invalid/expired link (AC #5),
// and the final "done" screen. Keeps the two pages visually consistent.
export function FlowState({
  emoji,
  title,
  description,
  children,
}: {
  emoji: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="border-white/10 bg-white/[0.04] rounded-3xl border p-7 text-center">
      <p className="text-4xl">{emoji}</p>
      <h1 className="text-cream mt-4 text-2xl font-bold">{title}</h1>
      {description && <p className="text-slate mt-2 text-sm">{description}</p>}
      {children}
    </div>
  );
}
