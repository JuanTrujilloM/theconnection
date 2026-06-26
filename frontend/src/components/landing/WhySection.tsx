import { Reveal } from '@/components/shared/Reveal';

const REASONS = [
  {
    icon: '🎯',
    title: '1 match semanal curado',
    description:
      'Nada de deslizar durante horas. Una sola persona, elegida por compatibilidad real.',
    chip: 'bg-cyan/10 ring-cyan/30',
    bar: 'from-cyan to-cyan/0',
    glow: 'hover:shadow-[0_22px_50px_-22px_rgba(0,229,255,0.5)]',
  },
  {
    icon: '📍',
    title: 'Citas reales coordinadas',
    description:
      'Llevamos la conversación hasta una cita en un lugar físico, no se queda en el chat.',
    chip: 'bg-blush/10 ring-blush/30',
    bar: 'from-blush to-blush/0',
    glow: 'hover:shadow-[0_22px_50px_-22px_rgba(255,107,139,0.5)]',
  },
  {
    icon: '🔒',
    title: 'Solo universitarios verificados',
    description:
      'Cada cuenta se valida con correo universitario. Comunidad cerrada y segura.',
    chip: 'bg-gold/10 ring-gold/30',
    bar: 'from-gold to-gold/0',
    glow: 'hover:shadow-[0_22px_50px_-22px_rgba(212,175,55,0.5)]',
  },
];

// "Why TheConnection" — three accent-colored cards highlighting the product's
// differentiators. Each lifts and glows in its own color on hover.
export function WhySection() {
  return (
    <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-20">
      {/* Soft blush glow to break the navy monotony. */}
      <div className="bg-blush/10 absolute top-1/2 left-1/2 -z-10 h-72 w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />

      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center">
          <span className="text-blush text-xs font-semibold tracking-widest uppercase">
            Por qué nosotros
          </span>
          <h2 className="text-cream mt-2 text-3xl font-bold sm:text-4xl">
            No es otra app de citas
          </h2>
          <p className="text-slate mx-auto mt-3 max-w-md">
            Somos la que de verdad te lleva a la cita.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {REASONS.map((reason, index) => (
            <Reveal key={reason.title} delay={index * 120}>
              <div
                className={`group border-white/10 from-navy-soft to-navy relative h-full overflow-hidden rounded-2xl border bg-gradient-to-b p-7 text-center transition-all duration-300 hover:-translate-y-1.5 hover:border-white/20 ${reason.glow}`}
              >
                {/* Accent bar that grows on hover. */}
                <div
                  className={`absolute inset-x-0 top-0 h-1 scale-x-0 bg-gradient-to-r transition-transform duration-300 group-hover:scale-x-100 ${reason.bar}`}
                />
                <div
                  className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ring-1 ${reason.chip}`}
                >
                  {reason.icon}
                </div>
                <h3 className="text-cream text-xl font-semibold">
                  {reason.title}
                </h3>
                <p className="text-slate mt-3 text-sm leading-relaxed">
                  {reason.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
