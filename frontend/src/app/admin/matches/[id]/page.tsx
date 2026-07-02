'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MatchStatusBadge } from '@/components/admin/StatusBadge';
import { MatchComparison } from '@/components/admin/MatchComparison';
import { useAdminMatch } from '@/hooks/useAdminData';
import { useCancelMatch } from '@/hooks/useAdminActions';
import { formatDate } from '@/lib/utils/format';

const CANCELABLE = new Set(['pending', 'confirmed']);

export default function AdminMatchDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: match, isLoading, isError } = useAdminMatch(params.id);
  const cancel = useCancelMatch();

  return (
    <>
      <Link
        href="/admin/matches"
        className="text-slate hover:text-cream mb-4 inline-block text-sm transition"
      >
        ← Volver a matches
      </Link>

      {isLoading ? (
        <p className="text-slate animate-pulse text-sm">Cargando match...</p>
      ) : isError || !match ? (
        <p className="text-blush text-sm">No se pudo cargar este match.</p>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-cream text-2xl font-bold">
                {match.userA.name}
                <span className="text-blush mx-2">♥</span>
                {match.userB.name}
              </h1>
              <MatchStatusBadge status={match.status} />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-slate text-xs">
                Creado {formatDate(match.createdAt)}
              </span>
              {CANCELABLE.has(match.status) && (
                <button
                  onClick={() => cancel.mutate(match.id)}
                  disabled={cancel.isPending}
                  className="border-blush/60 text-cream hover:bg-blush/10 rounded-full border px-4 py-2 text-sm font-medium transition disabled:opacity-50"
                >
                  Cancelar match
                </button>
              )}
            </div>
          </div>

          <MatchComparison match={match} />
        </>
      )}
    </>
  );
}
