// Toggleable selection chip. Cyan when selected, outlined when not.
export function Chip({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={`rounded-full border px-4 py-2 text-sm transition ${
        selected
          ? 'border-cyan bg-cyan/15 text-cyan'
          : 'border-white/15 text-slate hover:border-white/30 hover:text-cream'
      }`}
    >
      {label}
    </button>
  );
}
