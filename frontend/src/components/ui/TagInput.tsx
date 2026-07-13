'use client';

import { useState, type KeyboardEvent } from 'react';

// Typeable multi-select. User adds tags by typing + Enter/comma or by clicking a
// suggestion; tags are removable. State is owned by the caller (controlled).
export function TagInput({
  value,
  onChange,
  suggestions = [],
  placeholder = 'Escribe y presiona Enter',
  hasError = false,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  hasError?: boolean;
}) {
  const [draft, setDraft] = useState('');

  const addTag = (raw: string) => {
    const tag = raw.trim();
    // Case-insensitive de-dupe so "Música" and "música" don't both land.
    const exists = value.some((t) => t.toLowerCase() === tag.toLowerCase());
    if (tag && !exists) onChange([...value, tag]);
    setDraft('');
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag(draft);
    } else if (event.key === 'Backspace' && !draft && value.length) {
      removeTag(value[value.length - 1]);
    }
  };

  const openSuggestions = suggestions.filter(
    (s) => !value.some((t) => t.toLowerCase() === s.toLowerCase()),
  );

  return (
    <div className="space-y-3">
      <div
        className={`bg-navy-soft flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2 ${
          hasError ? 'border-blush' : 'border-white/10'
        }`}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="bg-cyan/15 text-cyan flex items-center gap-1.5 rounded-full px-3 py-1 text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Quitar ${tag}`}
              className="hover:text-cream"
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={value.length ? '' : placeholder}
          className="text-cream placeholder:text-slate min-w-[8rem] flex-1 bg-transparent py-1 text-sm outline-none"
        />
      </div>

      {openSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {openSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              className="border-white/15 text-slate hover:border-cyan/40 hover:text-cream rounded-full border px-3 py-1 text-xs transition"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
