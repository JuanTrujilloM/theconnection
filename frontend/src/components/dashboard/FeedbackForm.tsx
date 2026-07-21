'use client';

import { useState } from 'react';
import { useSubmitFeedback } from '@/hooks/useSubmitFeedback';
import type { PendingFeedback } from '@/types/feedback';

// HU-10 form. "occurred" gates the rest: a rating only makes sense when the date
// happened, so it's required then and hidden otherwise.
export function FeedbackForm({ pending }: { pending: PendingFeedback }) {
  const { mutate, isPending, isError } = useSubmitFeedback();
  const [occurred, setOccurred] = useState<boolean | null>(null);
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [noShowReason, setNoShowReason] = useState('');

  const canSubmit =
    occurred === false || (occurred === true && rating > 0);

  const submit = () => {
    if (occurred === null || !canSubmit) return;
    mutate({
      dateId: pending.dateId,
      occurred,
      rating: occurred ? rating : undefined,
      comments: comments.trim() || undefined,
      noShowReason: !occurred ? noShowReason.trim() || undefined : undefined,
    });
  };

  return (
    <div className="mt-4">
      <div className="grid grid-cols-2 gap-2.5">
        <OccurredButton
          active={occurred === true}
          onClick={() => setOccurred(true)}
        >
          ✅ Fui
        </OccurredButton>
        <OccurredButton
          active={occurred === false}
          onClick={() => setOccurred(false)}
        >
          🙅 No fui
        </OccurredButton>
      </div>

      {occurred === true && (
        <div className="mt-4 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
              onClick={() => setRating(star)}
              className={`text-3xl transition ${
                star <= rating ? 'text-gold' : 'text-white/20'
              }`}
            >
              ★
            </button>
          ))}
        </div>
      )}

      {occurred === false && (
        <textarea
          value={noShowReason}
          onChange={(event) => setNoShowReason(event.target.value)}
          placeholder="¿Qué pasó? (opcional)"
          rows={2}
          className="border-white/10 text-cream placeholder:text-slate mt-4 w-full rounded-2xl border bg-white/[0.04] p-3 text-sm outline-none focus:border-blush/50"
        />
      )}

      {occurred !== null && (
        <textarea
          value={comments}
          onChange={(event) => setComments(event.target.value)}
          placeholder="Comentarios (opcional)"
          rows={2}
          className="border-white/10 text-cream placeholder:text-slate mt-2.5 w-full rounded-2xl border bg-white/[0.04] p-3 text-sm outline-none focus:border-blush/50"
        />
      )}

      {isError && (
        <p className="text-coral mt-2 text-xs">
          No pudimos guardar tu respuesta. Intenta de nuevo.
        </p>
      )}

      <button
        type="button"
        disabled={!canSubmit || isPending}
        onClick={submit}
        className="from-blush to-coral text-cream mt-4 block w-full rounded-2xl bg-gradient-to-r py-3.5 text-sm font-bold transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? 'Enviando...' : 'Enviar feedback'}
      </button>
    </div>
  );
}

function OccurredButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border py-3 text-sm font-semibold transition ${
        active
          ? 'border-blush/60 bg-blush/15 text-cream'
          : 'border-white/10 text-slate bg-white/[0.03] hover:text-cream'
      }`}
    >
      {children}
    </button>
  );
}
