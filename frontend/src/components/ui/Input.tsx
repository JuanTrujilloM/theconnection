import { forwardRef, type InputHTMLAttributes } from 'react';

const base =
  'w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100';

// forwardRef so react-hook-form's register() can attach its ref.
// className is appended, letting callers tweak per-field styling (e.g. the OTP field).
export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function Input({ className = '', ...props }, ref) {
  return <input ref={ref} className={`${base} ${className}`} {...props} />;
});
