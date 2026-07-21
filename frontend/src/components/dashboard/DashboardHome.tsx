'use client';

import { Logo } from '@/components/shared/Logo';
import { LogoutButton } from '@/components/shared/LogoutButton';
import { Card } from '@/components/ui/Card';
import { AvailabilityToggle } from '@/components/dashboard/AvailabilityToggle';
import { SearchingHero } from '@/components/dashboard/heroes/SearchingHero';
import { PausedHero } from '@/components/dashboard/heroes/PausedHero';
import { NewMatchHero } from '@/components/dashboard/heroes/NewMatchHero';
import { ConfirmedDateHero } from '@/components/dashboard/heroes/ConfirmedDateHero';
import { FeedbackHero } from '@/components/dashboard/heroes/FeedbackHero';
import { StatsRow } from '@/components/dashboard/StatsRow';
import { ProfileCompleteness } from '@/components/dashboard/ProfileCompleteness';
import { VibeChips } from '@/components/dashboard/VibeChips';
import { QuickLinks } from '@/components/dashboard/QuickLinks';
import { useCurrentMatch } from '@/hooks/useCurrentMatch';
import { useMyProfile } from '@/hooks/useMyProfile';
import { usePendingFeedback } from '@/hooks/usePendingFeedback';
import {
  AVAILABILITY_STATUS,
  type AvailabilityStatus,
} from '@/lib/constants/profile';
import type { AuthUser } from '@/types/auth';

// State-driven dashboard: one hero picked by where the user is in the weekly
// cycle, then context sections. Priority: pending feedback > confirmed date >
// new match > paused/searching.
export function DashboardHome({ user }: { user: AuthUser }) {
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: match, isLoading: matchLoading } = useCurrentMatch();
  const { data: pendingFeedback, isLoading: feedbackLoading } =
    usePendingFeedback();

  const loading = profileLoading || matchLoading || feedbackLoading;

  const status =
    (profile?.status as AvailabilityStatus | undefined) ??
    AVAILABILITY_STATUS.SEARCHING;
  const isConfirmed = match?.status === 'confirmed' && match.date;
  const isPending = match?.status === 'pending';
  const hasActiveMatch = isConfirmed || isPending;

  return (
    <>
      <div className="flex items-center justify-between">
        <Logo />
        <LogoutButton />
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="border-white/10 rounded-3xl border bg-white/[0.03] p-6">
            <p className="text-slate animate-pulse text-sm">
              Cargando tu semana...
            </p>
          </div>
        ) : pendingFeedback ? (
          <FeedbackHero pending={pendingFeedback} />
        ) : isConfirmed && match?.date ? (
          <ConfirmedDateHero match={match} date={match.date} />
        ) : isPending && match ? (
          <NewMatchHero match={match} />
        ) : status === AVAILABILITY_STATUS.PAUSED ? (
          <PausedHero />
        ) : (
          <SearchingHero />
        )}
      </div>

      <StatsRow />

      {/* Profile context and the pause control only matter while waiting — during
          an active match or a feedback prompt they'd distract from the action. */}
      {!hasActiveMatch && !pendingFeedback && !loading && (
        <>
          <ProfileCompleteness />
          <VibeChips />

          <div className="mt-5">
            <Card
              title="Tu disponibilidad"
              description="Pausa cuando encuentres a alguien o quieras un descanso."
            >
              <AvailabilityToggle status={status} />
            </Card>
          </div>
        </>
      )}

      <div className="mt-5">
        <QuickLinks isAdmin={user.isAdmin} />
      </div>
    </>
  );
}
