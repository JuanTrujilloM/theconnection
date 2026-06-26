import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

const variants: Record<Variant, string> = {
  // Cyan fill for the main call to action.
  primary:
    'bg-cyan text-navy-deep hover:brightness-110 shadow-[0_8px_30px_-8px_rgba(0,229,255,0.6)]',
  // Blush outline for secondary actions.
  secondary:
    'border border-blush/60 text-cream hover:bg-blush/10 hover:border-blush',
  // Transparent for low-emphasis actions.
  ghost: 'text-slate hover:text-cream',
};

// Brand button. Defaults to the cyan primary CTA; pass `variant` to switch.
export function Button({
  className = '',
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
