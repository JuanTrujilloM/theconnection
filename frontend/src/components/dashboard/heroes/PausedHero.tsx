// Informational hero for the PAUSED state. Reactivation is handled by the
// AvailabilityToggle rendered right below it, so this carries no action of its own.
export function PausedHero() {
  return (
    <section className="border-white/10 rounded-3xl border bg-navy-soft/50 p-6">
      <span className="border-white/15 inline-flex items-center gap-1.5 rounded-full border bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-[#aeb9c6]">
        ⏸ Búsqueda en pausa
      </span>
      <h1 className="text-cream mt-3.5 text-xl font-bold">
        No entrarás al match de esta semana
      </h1>
      <p className="text-slate mt-1.5 text-sm">
        Reactiva cuando quieras volver a la lista del domingo.
      </p>
    </section>
  );
}
