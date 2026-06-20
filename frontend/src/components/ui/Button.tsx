import type { ButtonHTMLAttributes } from 'react';

const base =
  'w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition disabled:opacity-50 dark:bg-white dark:text-zinc-900';

export function Button({
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`${base} ${className}`} {...props} />;
}
