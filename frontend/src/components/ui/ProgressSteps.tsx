// Onboarding progress indicator: "Paso N de total" plus a segmented bar.
export function ProgressSteps({
  current,
  total,
  label,
}: {
  current: number;
  total: number;
  label: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-cyan text-xs font-semibold tracking-widest uppercase">
          Paso {current} de {total}
        </span>
        <span className="text-slate text-xs">{label}</span>
      </div>
      <div className="flex gap-2">
        {Array.from({ length: total }, (_, index) => (
          <span
            key={index}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              index < current ? 'bg-cyan' : 'bg-white/10'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
