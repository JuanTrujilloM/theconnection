import { forwardRef, type InputHTMLAttributes } from 'react';

// Brand text input on the navy surface. Cyan focus ring, blush ring on error.
const base =
  'w-full rounded-xl border bg-navy-soft px-4 py-2.5 text-sm text-cream placeholder:text-slate outline-none transition focus:border-cyan focus:ring-2 focus:ring-cyan/30';

// forwardRef so react-hook-form's register() can attach its ref.
export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }
>(function Input({ className = '', hasError = false, ...props }, ref) {
  const borderColor = hasError ? 'border-blush' : 'border-white/10';
  return (
    <input ref={ref} className={`${base} ${borderColor} ${className}`} {...props} />
  );
});
