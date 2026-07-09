import type { CalendarDay } from '@/types/availability';

// HU-09 calendar. One section per day (mobile-first: 7×7 cells don't fit a phone
// width), each with the 1-hour slots as toggleable chips. Selection is keyed by
// `${date}|${timeSlot}` in the parent.
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
  return (
    <div className="space-y-4">
      {days.map((day) => (
        <div key={day.date}>
          <h3 className="text-cream/80 mb-2 text-sm font-medium capitalize">
            {day.label}
          </h3>
          <div className="flex flex-wrap gap-2">
            {timeSlots.map((slot) => {
              const isSelected = selected.has(`${day.date}|${slot}`);
              return (
                <button
                  key={slot}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onToggle(day.date, slot)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    isSelected
                      ? 'border-cyan bg-cyan/15 text-cream'
                      : 'border-white/10 bg-navy-soft/70 text-slate hover:border-white/30'
                  }`}
                >
                  {formatSlot(slot)}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// "13:00" -> "1 pm". All slots fall in the noon–7pm window, so they're all pm.
function formatSlot(slot: string): string {
  const hour = Number(slot.slice(0, 2));
  const hour12 = hour > 12 ? hour - 12 : hour;
  return `${hour12} pm`;
}
