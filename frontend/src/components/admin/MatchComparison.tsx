import type { ReactNode } from 'react';
import { Badge, UserStatusBadge } from '@/components/admin/StatusBadge';
import { formatCOP, formatDate, formatCalendarDate } from '@/lib/utils/format';
import type {
  AdminMatchDetail,
  AdminUserDetail,
  AdminPreferences,
} from '@/types/admin';

// Side-by-side comparison of the two users in a match, plus the compatibility
// signals, venue options, availability, date and feedback.
export function MatchComparison({ match }: { match: AdminMatchDetail }) {
  const shared = new Set(match.sharedHobbies.map((h) => h.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <UserCard user={match.userA} shared={shared} />
        <UserCard user={match.userB} shared={shared} />
      </div>

      <Compatibility match={match} />

      <PreferencesTable a={match.userA} b={match.userB} />

      {match.venueOptions.length > 0 && (
        <Section title="Lugares sugeridos (HU-06)">
          <div className="space-y-2">
            {match.venueOptions.map((option) => (
              <div
                key={option.venueName}
                className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] px-3 py-2"
              >
                <div>
                  <span className="text-cream text-sm">{option.venueName}</span>
                  <span className="text-slate ml-2 text-xs">{option.type}</span>
                </div>
                <div className="flex gap-2">
                  <SelectPill label="A" on={option.userASelected} />
                  <SelectPill label="B" on={option.userBSelected} />
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title="Disponibilidad (HU-09)">
        <div className="grid grid-cols-2 gap-4">
          <AvailabilityList
            name={match.userA.name}
            slots={match.availability.userA}
          />
          <AvailabilityList
            name={match.userB.name}
            slots={match.availability.userB}
          />
        </div>
      </Section>

      {match.date && (
        <Section title="Cita confirmada (HU-08)">
          <p className="text-cream text-sm">{match.date.venueName}</p>
          <p className="text-slate mt-0.5 text-xs">{match.date.address}</p>
          <p className="text-slate mt-1 text-xs">
            {formatDate(match.date.scheduledAt)} · {match.date.status}
          </p>
        </Section>
      )}

      {match.feedback.length > 0 && (
        <Section title="Feedback (HU-10)">
          <div className="space-y-3">
            {match.feedback.map((fb) => (
              <div key={fb.userName} className="rounded-xl bg-white/[0.03] p-3">
                <div className="flex items-center justify-between">
                  <span className="text-cream text-sm font-medium">
                    {fb.userName}
                  </span>
                  {fb.occurred ? (
                    <Badge label="Asistió" tone="green" />
                  ) : (
                    <Badge label="No asistió" tone="blush" />
                  )}
                </div>
                {fb.rating != null && (
                  <p className="text-gold mt-1 text-sm">
                    {'★'.repeat(fb.rating)}
                    <span className="text-white/15">
                      {'★'.repeat(5 - fb.rating)}
                    </span>
                  </p>
                )}
                <p className="text-slate mt-1 text-xs">
                  {fb.comments ?? fb.noShowReason ?? '—'}
                  {fb.amountSpent != null &&
                    ` · ${formatCOP(fb.amountSpent)}`}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function UserCard({
  user,
  shared,
}: {
  user: AdminUserDetail;
  shared: Set<string>;
}) {
  return (
    <div className="border-white/10 bg-navy-card/60 rounded-2xl border p-5">
      <div className="flex items-center gap-4">
        {user.primaryPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.primaryPhoto}
            alt={user.name}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="bg-navy-soft flex h-16 w-16 items-center justify-center rounded-full text-xl">
            {user.name.charAt(0)}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-cream truncate text-lg font-semibold">
              {user.name}
            </h3>
            {user.age != null && (
              <span className="text-slate text-sm">{user.age}</span>
            )}
          </div>
          <p className="text-slate mt-0.5 truncate text-xs">{user.email}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {user.status && <UserStatusBadge status={user.status} />}
            {user.isVerified ? (
              <Badge label="Verificado" tone="green" />
            ) : (
              <Badge label="Sin verificar" tone="gold" />
            )}
          </div>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <Fact label="Universidad" value={user.university} />
        <Fact label="Carrera" value={user.major} />
        <Fact label="Semestre" value={user.semester} />
        <Fact label="Género" value={user.gender} />
        <Fact
          label="Estatura"
          value={user.height ? `${user.height} cm` : null}
        />
      </dl>

      {user.biography && (
        <p className="text-slate mt-3 text-sm italic">“{user.biography}”</p>
      )}

      <div className="mt-4">
        <p className="text-slate mb-2 text-xs font-semibold tracking-wide uppercase">
          Intereses
        </p>
        <div className="flex flex-wrap gap-1.5">
          {user.hobbies.map((hobby) => {
            const isShared = shared.has(hobby.toLowerCase());
            return (
              <span
                key={hobby}
                className={`rounded-full px-2.5 py-0.5 text-xs ${
                  isShared
                    ? 'bg-cyan/15 text-cyan font-medium'
                    : 'bg-white/5 text-slate'
                }`}
              >
                {hobby}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Derived compatibility signals, computed from the two users' data.
function Compatibility({ match }: { match: AdminMatchDetail }) {
  const a = match.userA;
  const b = match.userB;
  const pa = a.preferences;
  const pb = b.preferences;

  const sameUniversity = a.university === b.university;
  const relationshipAligned =
    pa != null &&
    pb != null &&
    (pa.relationshipType === pb.relationshipType ||
      pa.relationshipType === 'Abierto a todo' ||
      pb.relationshipType === 'Abierto a todo');
  const ageOk =
    pa != null &&
    pb != null &&
    a.age != null &&
    b.age != null &&
    b.age >= pa.minAge &&
    b.age <= pa.maxAge &&
    a.age >= pb.minAge &&
    a.age <= pb.maxAge;

  return (
    <Section title="Compatibilidad">
      <div className="mb-4 flex items-center gap-3">
        <span className="text-slate text-sm">Score del algoritmo:</span>
        <span className="text-cyan text-2xl font-bold">
          {match.compatibilityScore.toFixed(1)}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Signal ok={match.sharedHobbies.length > 0}>
          {match.sharedHobbies.length} interés(es) en común
        </Signal>
        <Signal ok={ageOk}>Edad dentro del rango mutuo</Signal>
        <Signal ok={relationshipAligned}>Tipo de relación compatible</Signal>
        <Signal ok={sameUniversity} neutral={!sameUniversity}>
          {sameUniversity ? 'Misma universidad' : 'Universidades distintas'}
        </Signal>
      </div>

      {match.sharedHobbies.length > 0 && (
        <div className="mt-4">
          <p className="text-slate mb-2 text-xs font-semibold tracking-wide uppercase">
            Intereses compartidos
          </p>
          <div className="flex flex-wrap gap-1.5">
            {match.sharedHobbies.map((hobby) => (
              <span
                key={hobby}
                className="bg-cyan/15 text-cyan rounded-full px-2.5 py-0.5 text-xs font-medium"
              >
                {hobby}
              </span>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}

function PreferencesTable({
  a,
  b,
}: {
  a: AdminUserDetail;
  b: AdminUserDetail;
}) {
  if (!a.preferences || !b.preferences) return null;
  const rows: { label: string; key: keyof AdminPreferences }[] = [
    { label: 'Busca', key: 'relationshipType' },
    { label: 'Orientación', key: 'orientation' },
    { label: 'Interés de género', key: 'genderInterest' },
    { label: 'Rango de edad', key: 'minAge' },
    { label: 'Preferencia de estatura', key: 'heightRange' },
    { label: 'Energía / vibe', key: 'energyVibe' },
    { label: 'Misma universidad', key: 'sameUniversity' },
  ];

  const render = (prefs: AdminPreferences, key: keyof AdminPreferences) => {
    if (key === 'minAge') return `${prefs.minAge}–${prefs.maxAge}`;
    if (key === 'sameUniversity') return prefs.sameUniversity ? 'Sí' : 'No';
    return String(prefs[key]);
  };

  return (
    <Section title="Preferencias">
      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="text-slate px-4 py-2 text-xs font-semibold">
                {a.name}
              </th>
              <th className="text-slate px-4 py-2 text-center text-xs font-semibold">
                Campo
              </th>
              <th className="text-slate px-4 py-2 text-right text-xs font-semibold">
                {b.name}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.key}
                className="border-b border-white/5 last:border-0"
              >
                <td className="text-cream px-4 py-2">
                  {render(a.preferences!, row.key)}
                </td>
                <td className="text-slate px-4 py-2 text-center text-xs">
                  {row.label}
                </td>
                <td className="text-cream px-4 py-2 text-right">
                  {render(b.preferences!, row.key)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function AvailabilityList({
  name,
  slots,
}: {
  name: string;
  slots: { date: string; timeSlot: string }[];
}) {
  return (
    <div>
      <p className="text-slate mb-2 text-xs font-medium">{name}</p>
      {slots.length === 0 ? (
        <p className="text-slate/60 text-xs">Sin franjas seleccionadas</p>
      ) : (
        <ul className="space-y-1">
          {slots.map((slot, index) => (
            <li key={index} className="text-cream text-xs">
              {formatCalendarDate(slot.date)} · {slot.timeSlot}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-white/10 bg-navy-card/40 rounded-2xl border p-5">
      <h2 className="text-cream mb-3 text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-slate text-xs">{label}</dt>
      <dd className="text-cream">{value ?? '—'}</dd>
    </div>
  );
}

function Signal({
  ok,
  neutral,
  children,
}: {
  ok: boolean;
  neutral?: boolean;
  children: ReactNode;
}) {
  const tone = neutral
    ? 'bg-white/5 text-slate'
    : ok
      ? 'bg-emerald-400/15 text-emerald-300'
      : 'bg-white/5 text-slate line-through';
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${tone}`}>
      {ok && !neutral ? '✓ ' : ''}
      {children}
    </span>
  );
}

function SelectPill({ label, on }: { label: string; on: boolean }) {
  return (
    <span
      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
        on ? 'bg-cyan text-navy-deep' : 'bg-white/5 text-slate'
      }`}
      title={on ? 'Seleccionado' : 'No seleccionado'}
    >
      {label}
    </span>
  );
}
