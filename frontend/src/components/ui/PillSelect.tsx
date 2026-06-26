import { Chip } from './Chip';

// Single-select pill group. Exactly one option is active at a time.
export function PillSelect({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string | undefined;
  onChange: (next: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Chip
          key={option}
          label={option}
          selected={value === option}
          onToggle={() => onChange(option)}
        />
      ))}
    </div>
  );
}
