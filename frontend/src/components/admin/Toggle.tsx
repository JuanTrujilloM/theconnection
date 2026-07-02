// Accessible on/off switch. Controlled: parent owns `checked` and reacts to
// `onChange`. Disabled while a mutation is in flight.
export function Toggle({
  checked,
  onChange,
  disabled,
  labelOn = 'Activo',
  labelOff = 'Inactivo',
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  labelOn?: string;
  labelOff?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 disabled:opacity-50"
    >
      <span
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition ${
          checked ? 'bg-cyan' : 'bg-white/15'
        }`}
      >
        <span
          className={`bg-navy-deep inline-block h-3.5 w-3.5 transform rounded-full transition ${
            checked ? 'translate-x-4' : 'translate-x-1'
          }`}
        />
      </span>
      <span
        className={`text-xs font-medium ${checked ? 'text-cyan' : 'text-slate'}`}
      >
        {checked ? labelOn : labelOff}
      </span>
    </button>
  );
}
