'use client';

import { FeedbackForm } from '@/components/dashboard/FeedbackForm';
import type { PendingFeedback } from '@/types/feedback';

// Highest-priority hero (HU-10): a past date is waiting on this user's feedback.
export function FeedbackHero({ pending }: { pending: PendingFeedback }) {
  const who = pending.partnerName ?? 'tu match';

  return (
    <section className="border-blush/25 relative overflow-hidden rounded-3xl border bg-gradient-to-br from-blush/[0.16] to-navy-soft/50 p-6">
      <span className="border-blush/40 bg-blush/15 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold text-[#ffc0d0]">
        ♥ Cuéntanos
      </span>
      <h1 className="text-cream mt-3.5 text-xl font-bold">
        ¿Cómo te fue con {who}?
      </h1>
      <p className="text-slate mt-1.5 text-sm">
        Tu respuesta mejora tus próximos matches.
      </p>
      <FeedbackForm pending={pending} />
    </section>
  );
}
