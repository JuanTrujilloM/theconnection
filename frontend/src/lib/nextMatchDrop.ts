// The weekly match runs Sundays 7pm Colombia (UTC-5), which is Monday 00:00 UTC.
// Mirror of the EventBridge rule `cron(0 0 ? * MON *)`; keep in sync with it.
export function nextMatchDrop(from: Date = new Date()): Date {
  const daysUntilMonday = (8 - from.getUTCDay()) % 7;
  const candidate = new Date(
    Date.UTC(
      from.getUTCFullYear(),
      from.getUTCMonth(),
      from.getUTCDate() + daysUntilMonday,
      0,
      0,
      0,
      0,
    ),
  );
  // daysUntilMonday is 0 on Mondays, so a same-day past instant rolls to next week.
  if (candidate.getTime() <= from.getTime()) {
    candidate.setUTCDate(candidate.getUTCDate() + 7);
  }
  return candidate;
}
