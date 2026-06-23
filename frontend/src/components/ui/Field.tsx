import type { ReactNode } from 'react';

// Label + control + inline error wrapper. Errors render in blush per the brand.
export function Field({
  label,
  htmlFor,
  error,
  optional = false,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="text-cream flex items-center gap-2 text-sm font-medium"
      >
        {label}
        {optional && <span className="text-slate text-xs">(opcional)</span>}
      </label>
      {children}
      {error && <p className="text-blush text-xs">{error}</p>}
    </div>
  );
}
