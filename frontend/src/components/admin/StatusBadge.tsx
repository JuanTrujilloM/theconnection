type Tone = 'cyan' | 'gold' | 'green' | 'slate' | 'blush';

const tones: Record<Tone, string> = {
  cyan: 'bg-cyan/15 text-cyan',
  gold: 'bg-gold/15 text-gold',
  green: 'bg-emerald-400/15 text-emerald-300',
  slate: 'bg-white/10 text-slate',
  blush: 'bg-blush/15 text-blush',
};

// Spanish labels + tone per match status (pending/confirmed/completed/canceled).
const MATCH: Record<string, { label: string; tone: Tone }> = {
  pending: { label: 'Pendiente', tone: 'gold' },
  confirmed: { label: 'Confirmado', tone: 'cyan' },
  completed: { label: 'Completado', tone: 'green' },
  canceled: { label: 'Cancelado', tone: 'slate' },
};

const USER_STATUS: Record<string, { label: string; tone: Tone }> = {
  SEARCHING: { label: 'Buscando', tone: 'cyan' },
  PAUSED: { label: 'En pausa', tone: 'slate' },
};

export function Badge({
  label,
  tone = 'slate',
}: {
  label: string;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {label}
    </span>
  );
}

export function MatchStatusBadge({ status }: { status: string }) {
  const entry = MATCH[status] ?? { label: status, tone: 'slate' as Tone };
  return <Badge label={entry.label} tone={entry.tone} />;
}

export function UserStatusBadge({ status }: { status: string }) {
  const entry = USER_STATUS[status] ?? { label: status, tone: 'slate' as Tone };
  return <Badge label={entry.label} tone={entry.tone} />;
}
