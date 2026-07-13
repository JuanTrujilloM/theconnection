import type { ReactNode } from 'react';

// Title + description with an optional action slot (e.g. a "+ Nuevo" button),
// shared by every admin page for a consistent header.
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-cream text-2xl font-bold">{title}</h1>
        {description && <p className="text-slate mt-1 text-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}
