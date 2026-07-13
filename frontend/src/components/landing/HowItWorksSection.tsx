import { Reveal } from '@/components/shared/Reveal';

const STEPS = [
  {
    icon: '📝',
    title: 'Crea tu perfil',
    description:
      'Cuéntanos quién eres, qué te gusta y qué buscas. Solo toma unos minutos.',
    accent: 'text-cyan',
    chip: 'bg-cyan/10 ring-cyan/30',
    glow: 'hover:shadow-[0_18px_40px_-18px_rgba(0,229,255,0.45)]',
  },
  {
    icon: '🤖',
    title: 'La IA encuentra tu match',
    description:
      'Cada domingo nuestro algoritmo elige a una persona compatible contigo.',
    accent: 'text-blush',
    chip: 'bg-blush/10 ring-blush/30',
    glow: 'hover:shadow-[0_18px_40px_-18px_rgba(255,107,139,0.45)]',
  },
  {
    icon: '💬',
    title: 'Coordina por WhatsApp',
    description:
      'Acordamos lugar, día y hora automáticamente. Tú solo confirma.',
    accent: 'text-gold',
    chip: 'bg-gold/10 ring-gold/30',
    glow: 'hover:shadow-[0_18px_40px_-18px_rgba(212,175,55,0.45)]',
  },
  {
    icon: '✨',
    title: '¡Disfruta la cita!',
    description:
      'Llega al lugar curado para ustedes y conoce a alguien real, cara a cara.',
    accent: 'text-cyan',
    chip: 'bg-cyan/10 ring-cyan/30',
    glow: 'hover:shadow-[0_18px_40px_-18px_rgba(0,229,255,0.45)]',
  },
];

// "How it works" — four centered steps that reveal in a staggered cascade and
// lift on hover. Each step carries its own accent color.
export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center">
          <span className="text-cyan text-xs font-semibold tracking-widest uppercase">
            Cómo funciona
          </span>
          <h2 className="text-cream mt-2 text-3xl font-bold sm:text-4xl">
            Cuatro pasos hacia una{' '}
            <span className="from-coral to-flame bg-gradient-to-r bg-clip-text text-transparent">
              cita real
            </span>
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <Reveal key={step.title} delay={index * 110}>
              <div
                className={`group border-white/10 bg-navy-soft h-full rounded-2xl border p-6 text-center transition-all duration-300 hover:-translate-y-1.5 hover:border-white/20 ${step.glow}`}
              >
                <div
                  className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ring-1 transition-transform duration-300 group-hover:scale-110 ${step.chip}`}
                >
                  {step.icon}
                </div>
                <span className={`text-xs font-bold ${step.accent}`}>
                  PASO 0{index + 1}
                </span>
                <h3 className="text-cream mt-1 text-lg font-semibold">
                  {step.title}
                </h3>
                <p className="text-slate mx-auto mt-2 max-w-[15rem] text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
