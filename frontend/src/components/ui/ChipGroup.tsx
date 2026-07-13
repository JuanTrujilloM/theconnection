import { Chip } from './Chip';

// Multi-select chip group. Toggles options in/out of the selected array.
export function ChipGroup({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (option: string) => {
    onChange(
      value.includes(option)
        ? value.filter((item) => item !== option)
        : [...value, option],
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Chip
          key={option}
          label={option}
          selected={value.includes(option)}
          onToggle={() => toggle(option)}
        />
      ))}
    </div>
  );
}
