import { forwardRef, type SelectHTMLAttributes } from 'react';

const base =
  'w-full rounded-xl border bg-navy-soft px-4 py-2.5 text-sm text-cream outline-none transition focus:border-cyan focus:ring-2 focus:ring-cyan/30';

// Brand select. forwardRef so react-hook-form's register() can attach its ref.
export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { hasError?: boolean }
>(function Select({ className = '', hasError = false, children, ...props }, ref) {
  const borderColor = hasError ? 'border-blush' : 'border-white/10';
  return (
    <select
      ref={ref}
      className={`${base} ${borderColor} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
});
