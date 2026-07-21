'use client';

import { AuthGate } from '@/components/shared/AuthGate';
import { DashboardHome } from '@/components/dashboard/DashboardHome';

// State-driven home: the hero reflects where the user is in the weekly cycle
// (feedback, confirmed date, new match, paused, searching), with context
// sections below. Place + time selection live only in the public tokenized
// flow (/flow/:token/places), never here.
export default function DashboardPage() {
  return <AuthGate>{(user) => <DashboardHome user={user} />}</AuthGate>;
}
