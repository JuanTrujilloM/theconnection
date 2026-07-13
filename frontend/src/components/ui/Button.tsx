import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'sunset' | 'cyan';

// Warm coral→flame gradient ("Atardecer") — the app-wide main CTA. Dark coral
// text for contrast on the bright fill.
const SUNSET =
  'bg-gradient-to-r from-coral to-flame text-[#4A1B0C] hover:brightness-105 shadow-[0_8px_30px_-8px_rgba(255,122,60,0.7)]';

const variants: Record<Variant, string> = {
  // Primary CTA is warm across the app; `sunset` kept as an explicit alias.
  primary: SUNSET,
  sunset: SUNSET,
  // Cyan fill kept for the rare identity-forward action.
  cyan: 'bg-cyan text-navy-deep hover:brightness-110 shadow-[0_8px_30px_-8px_rgba(0,229,255,0.6)]',
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
