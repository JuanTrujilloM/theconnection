import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { PhoneMockup } from './PhoneMockup';

// Small stacked avatars built from gradients (no image assets).
const AVATARS = [
  'from-cyan to-blush',
  'from-blush to-gold',
  'from-gold to-cyan',
  'from-cyan to-navy-soft',
];

// Above-the-fold hero: editorial headline, subheadline, CTAs, a trust row and
// the phone mockup, layered over an animated brand gradient.
export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pt-28 pb-16 sm:px-6 sm:pt-36 sm:pb-20">
      {/* Animated gradient wash that drifts behind the content. */}
      <div className="from-navy-deep via-navy to-navy-soft animate-gradient absolute inset-0 -z-20 bg-gradient-to-br bg-[length:200%_200%]" />
      {/* Floating accent orbs in all three brand accents. */}
      <div className="bg-cyan/20 animate-float-slow absolute -top-20 -left-20 -z-10 h-72 w-72 rounded-full blur-3xl" />
      <div className="bg-blush/20 absolute top-40 -right-20 -z-10 h-80 w-80 rounded-full blur-3xl" />
      <div className="bg-gold/10 absolute bottom-0 left-1/3 -z-10 h-56 w-56 rounded-full blur-3xl" />

      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
        <div className="text-center lg:text-left">
          <span className="border-cyan/30 bg-cyan/10 text-cyan inline-block rounded-full border px-4 py-1.5 text-xs font-medium">
            Solo para universitarios verificados 🎓
          </span>

          <h1 className="text-cream mt-6 text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Tu próxima cita{' '}
            <span className="from-cyan via-blush to-gold animate-gradient bg-gradient-to-r bg-[length:200%_auto] bg-clip-text text-transparent">
              ya te está esperando
            </span>
          </h1>

          <p className="text-slate mx-auto mt-5 max-w-md text-lg lg:mx-0">
            Un match curado por IA cada semana, llevado hasta una cita real en un
            lugar de verdad. Sin scroll infinito. Sin perfiles falsos.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
            <Link href="/register" className="w-full sm:w-auto">
              <Button className="w-full transition-transform hover:scale-[1.03] sm:w-auto sm:px-8 sm:py-3.5 sm:text-base">
                Encuentra tu match →
              </Button>
            </Link>
            <a href="#como-funciona" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                className="w-full sm:w-auto sm:px-6 sm:py-3.5 sm:text-base"
              >
                Cómo funciona
              </Button>
            </a>
          </div>

          {/* Trust row to anchor the hero and add warmth. */}
          <div className="mt-8 flex items-center justify-center gap-3 lg:justify-start">
            <div className="flex -space-x-2">
              {AVATARS.map((gradient) => (
                <span
                  key={gradient}
                  className={`border-navy-deep h-8 w-8 rounded-full border-2 bg-gradient-to-br ${gradient}`}
                />
              ))}
            </div>
            <p className="text-slate text-sm">
              <span className="text-cream font-semibold">+500</span> estudiantes
              ya conectados
            </p>
          </div>
        </div>

        <PhoneMockup />
      </div>
    </section>
  );
}
