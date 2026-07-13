// CSS-only phone frame showing a simulated weekly-match WhatsApp notification.
// No image asset — everything is gradients, borders and emoji.
export function PhoneMockup() {
  return (
    <div className="animate-float relative mx-auto w-[260px] sm:w-[300px]">
      {/* Warm glow behind the device. */}
      <div className="bg-coral/20 absolute -inset-6 -z-10 rounded-[3rem] blur-3xl" />

      <div className="border-white/15 bg-navy rounded-[2.5rem] border-[10px] p-3 shadow-2xl">
        {/* Notch */}
        <div className="bg-navy-deep mx-auto mb-3 h-5 w-24 rounded-b-2xl" />

        <div className="bg-navy-deep space-y-4 rounded-[1.6rem] p-4">
          <div className="text-slate flex items-center justify-between text-[11px]">
            <span>9:41</span>
            <span>WhatsApp</span>
          </div>

          {/* Match notification card */}
          <div className="border-cyan/30 bg-navy-soft rounded-2xl border p-4">
            <div className="flex items-center gap-3">
              <div className="from-coral to-flame flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-xl">
                💌
              </div>
              <div>
                <p className="text-cream text-sm font-semibold">
                  TheConnection
                </p>
                <p className="text-slate text-[11px]">ahora</p>
              </div>
            </div>

            <p className="text-cream mt-3 text-sm leading-relaxed">
              ¡Tu match de la semana llegó! <span className="text-cyan">Sofía, 22</span> —
              Administración · EAFIT.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {['☕ Café', '🌿 Outdoor', '📚 Libros'].map((tag) => (
                <span
                  key={tag}
                  className="bg-cyan/10 text-cyan rounded-full px-2.5 py-1 text-[11px]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Compatibility pill */}
          <div className="bg-amber/10 border-amber/30 flex items-center justify-between rounded-xl border px-3 py-2">
            <span className="text-cream text-xs">Compatibilidad</span>
            <span className="text-amber text-sm font-bold">87%</span>
          </div>

          <div className="from-coral to-flame flex animate-pulse-glow items-center justify-center rounded-xl bg-gradient-to-r py-2.5 text-sm font-semibold text-[#4A1B0C]">
            Ver disponibilidad →
          </div>
        </div>
      </div>
    </div>
  );
}
