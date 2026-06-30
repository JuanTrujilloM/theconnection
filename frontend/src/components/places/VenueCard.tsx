import type { VenueSuggestion } from '@/types/venue';

// HU-06 suggestion card. Shows name, type, address, opening hours and a short
// description (acceptance criterion #2); the whole card toggles selection.
export function VenueCard({
  venue,
  selected,
  onToggle,
}: {
  venue: VenueSuggestion;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={`w-full rounded-2xl border p-5 text-left transition ${
        selected
          ? 'border-cyan bg-cyan/10'
          : 'border-white/10 bg-navy-soft/70 hover:border-white/30'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-cream font-semibold">{venue.name}</h3>
          <span className="text-cyan text-xs font-medium">{venue.type}</span>
        </div>
        <span
          aria-hidden
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${
            selected
              ? 'border-cyan bg-cyan text-navy-deep'
              : 'border-white/30 text-transparent'
          }`}
        >
          ✓
        </span>
      </div>

      <p className="text-slate mt-2 text-sm">{venue.description}</p>

      <dl className="text-slate mt-3 space-y-1 text-xs">
        <div className="flex gap-2">
          <dt className="text-cream/70 shrink-0">Dirección</dt>
          <dd>{venue.address}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-cream/70 shrink-0">Horario</dt>
          <dd>{venue.openingHours}</dd>
        </div>
      </dl>
    </button>
  );
}
