'use client';

import { useState } from 'react';
import type { CalendarDay } from '@/types/availability';

// HU-09 calendar, Google-Calendar style: days as columns, 1-hour slots as rows.
// Drag across cells to paint a range (mouse or touch), tap a cell to toggle one,
// tap a day header to select/clear the whole column. Selection is keyed by
// `${date}|${timeSlot}` in the parent, so the props API stays a flat Set + toggle.
type Drag = {
  startRow: number;
  startCol: number;
  curRow: number;
  curCol: number;
  mode: 'add' | 'remove'; // painting selected vs. clearing, fixed at drag start
};

export function AvailabilityCalendar({
  days,
  timeSlots,
  selected,
  onToggle,
}: {
  days: CalendarDay[];
  timeSlots: string[];
  selected: Set<string>;
  onToggle: (date: string, timeSlot: string) => void;
}) {
  // Only drives the live preview; the committed selection lives in the parent.
  const [drag, setDrag] = useState<Drag | null>(null);

  const keyOf = (row: number, col: number) =>
    `${days[col].date}|${timeSlots[row]}`;

  // Apply the painted rectangle: add or remove every cell in it, skipping ones
  // already in the target state so we don't toggle them back.
  const commit = (final: Drag) => {
    const wantSelected = final.mode === 'add';
    const { r0, r1, c0, c1 } = bounds(final);
    for (let row = r0; row <= r1; row++) {
      for (let col = c0; col <= c1; col++) {
        if (selected.has(keyOf(row, col)) !== wantSelected) {
          onToggle(days[col].date, timeSlots[row]);
        }
      }
    }
  };

  // Pointerdown starts a drag and wires the window listeners here (not in an
  // effect) so a fast tap — pointerdown+up in one tick — still commits. A closure
  // var tracks the latest rectangle; elementFromPoint drives it because a touch
  // drag keeps firing on the origin element, not the one under the finger.
  const startDrag = (row: number, col: number) => {
    const mode: Drag['mode'] = selected.has(keyOf(row, col)) ? 'remove' : 'add';
    let latest: Drag = { startRow: row, startCol: col, curRow: row, curCol: col, mode };
    setDrag(latest);

    const onMove = (event: PointerEvent) => {
      const target = document.elementFromPoint(
        event.clientX,
        event.clientY,
      ) as HTMLElement | null;
      const cell = target?.closest<HTMLElement>('[data-cell]');
      if (!cell) return;
      const r = Number(cell.dataset.row);
      const c = Number(cell.dataset.col);
      if (latest.curRow === r && latest.curCol === c) return;
      latest = { ...latest, curRow: r, curCol: c };
      setDrag(latest);
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      commit(latest);
      setDrag(null);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  // Toggle a whole day: fill it if any slot is empty, otherwise clear it.
  const toggleColumn = (col: number) => {
    const allSelected = timeSlots.every((_, row) =>
      selected.has(keyOf(row, col)),
    );
    timeSlots.forEach((_, row) => {
      if (selected.has(keyOf(row, col)) === allSelected) {
        onToggle(days[col].date, timeSlots[row]);
      }
    });
  };

  return (
    <div className="select-none">
      <div
        className="bg-navy-soft/40 grid touch-none overflow-hidden rounded-2xl border border-white/10"
        style={{
          gridTemplateColumns: `2.75rem repeat(${days.length}, minmax(0, 1fr))`,
        }}
      >
        {/* Header row: empty corner + one tappable header per day. */}
        <div className="border-b border-white/10" />
        {days.map((day, col) => {
          const [weekday, dayNumber] = day.label.split(' ');
          const allSelected = timeSlots.every((_, row) =>
            selected.has(keyOf(row, col)),
          );
          return (
            <button
              key={day.date}
              type="button"
              onClick={() => toggleColumn(col)}
              className={`flex flex-col items-center gap-0.5 border-b border-l border-white/10 py-1.5 text-center transition ${
                allSelected ? 'bg-cyan/10' : 'hover:bg-white/5'
              }`}
            >
              <span className="text-slate text-[10px] font-medium capitalize">
                {weekday}
              </span>
              <span
                className={`text-sm font-semibold ${
                  allSelected ? 'text-cyan' : 'text-cream'
                }`}
              >
                {dayNumber}
              </span>
            </button>
          );
        })}

        {/* One grid row per time slot: hour label on the left, then a cell per day. */}
        {timeSlots.map((slot, row) => (
          <div key={slot} className="contents">
            <div className="text-slate flex items-center justify-end pr-2 text-[11px] leading-tight">
              {formatSlot(slot)}
            </div>
            {days.map((day, col) => {
              const inDrag = drag ? within(drag, row, col) : false;
              // During a drag, the painted rectangle previews its target state.
              const isSelected = inDrag
                ? drag!.mode === 'add'
                : selected.has(keyOf(row, col));
              return (
                <div
                  key={day.date}
                  data-cell
                  data-row={row}
                  data-col={col}
                  role="button"
                  aria-pressed={selected.has(keyOf(row, col))}
                  aria-label={`${day.label} ${formatSlot(slot)}`}
                  tabIndex={0}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    startDrag(row, col);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onToggle(day.date, slot);
                    }
                  }}
                  className={`h-11 cursor-pointer border-l border-white/10 transition-colors ${
                    row === 0 ? '' : 'border-t'
                  } ${isSelected ? 'bg-cyan/70' : 'bg-transparent hover:bg-white/5'} ${
                    inDrag ? 'ring-cyan/60 ring-1 ring-inset' : ''
                  }`}
                />
              );
            })}
          </div>
        ))}
      </div>

      <p className="text-slate mt-3 text-center text-xs">
        Arrastra para marcar varias horas. Toca un día para seleccionarlo entero.
      </p>
    </div>
  );
}

function bounds(drag: Drag) {
  return {
    r0: Math.min(drag.startRow, drag.curRow),
    r1: Math.max(drag.startRow, drag.curRow),
    c0: Math.min(drag.startCol, drag.curCol),
    c1: Math.max(drag.startCol, drag.curCol),
  };
}

function within(drag: Drag, row: number, col: number): boolean {
  const { r0, r1, c0, c1 } = bounds(drag);
  return row >= r0 && row <= r1 && col >= c0 && col <= c1;
}

// "13:00" -> "1 pm". All slots fall in the noon–7pm window, so they're all pm.
function formatSlot(slot: string): string {
  const hour = Number(slot.slice(0, 2));
  const hour12 = hour > 12 ? hour - 12 : hour;
  return `${hour12} pm`;
}
