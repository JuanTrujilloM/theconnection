'use client';

import type { CurrentMatch } from '@/types/match';

// Active 'pending' match: show the partner so the user knows who it is. The
// accept/reject action lives only in the tokenized WhatsApp flow (no
// authenticated endpoint), so the CTA points there rather than deep-linking.
export function NewMatchHero({ match }: { match: CurrentMatch }) {
  const partner = match.partner;
  const score = match.compatibilityPercent;

  return (
    <section className="border-coral/25 relative overflow-hidden rounded-3xl border bg-gradient-to-br from-coral/[0.16] to-flame/[0.06] p-6">
      <span className="border-coral/40 bg-coral/15 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold text-[#ffb0b2]">
        ✦ Nuevo match de la semana
      </span>

      {partner ? (
        <>
          <div className="mt-4 flex items-center gap-3.5">
            {partner.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={partner.photoUrl}
                alt={partner.name}
                className="border-white/10 h-[76px] w-[76px] flex-none rounded-2xl border object-cover"
              />
            ) : (
              <div className="border-white/10 bg-navy-soft flex h-[76px] w-[76px] flex-none items-center justify-center rounded-2xl border text-2xl">
                {partner.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-cream text-lg font-bold">
                {partner.name}, {partner.age}
              </p>
              <p className="text-slate mt-0.5 text-xs">
                {partner.university} · {partner.major}
              </p>
              {partner.biography && (
                <p className="mt-2 text-xs text-[#c3ccd6] italic">
                  “{partner.biography}”
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2.5 text-xs text-[#c3ccd6]">
            <span>Compatibilidad</span>
            <span className="h-[7px] flex-1 overflow-hidden rounded-full bg-white/10">
              <span
                className="from-coral to-flame block h-full rounded-full bg-gradient-to-r"
                style={{ width: `${score}%` }}
              />
            </span>
            <span className="text-flame font-bold">{score}%</span>
          </div>
        </>
      ) : (
        <p className="text-slate mt-4 text-sm">
          Tu match de la semana ya está listo.
        </p>
      )}

      <div className="border-flame/25 bg-flame/[0.08] mt-5 rounded-2xl border p-3.5 text-center">
        <p className="text-cream text-sm font-semibold">
          📲 Responde por WhatsApp
        </p>
        <p className="text-slate mt-1 text-xs">
          Te enviamos un enlace para elegir lugar y horario. Tienes 24 h para
          responder.
        </p>
      </div>
    </section>
  );
}
