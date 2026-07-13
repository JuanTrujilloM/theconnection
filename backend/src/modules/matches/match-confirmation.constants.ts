// HU-08 confirmation flow.

// Both users completing the flow IS mutual acceptance (HU-07, implicit), so the
// Date is born accepted — no separate "awaiting confirmation" step.
export const DATE_ACCEPTED_STATUS = 'accepted';

// A match with a scheduled date is confirmed (leaves the "pending" state).
export const CONFIRMED_MATCH_STATUS = 'confirmed';

// Match couldn't be scheduled; leaving the active set (pending/confirmed) makes
// both users eligible again in the next weekly cycle.
export const EXPIRED_MATCH_STATUS = 'expired';

// No time overlap: nudge to add more availability at most this many times before
// recycling. One extra chance keeps a strong match alive without endless loops.
export const MAX_SCHEDULE_ATTEMPTS = 1;

// After a nudge, recycle if still no overlap by this deadline (mirrors HU-07's 24h).
export const SCHEDULE_DEADLINE_HOURS = 24;

// Hourly sweep that recycles matches whose nudge deadline passed with no date.
export const RECYCLE_CRON = '0 * * * *';

// Colombia is a fixed UTC-5 (no DST), so a slot's local hour maps to UTC by +5.
// Used to turn a calendar day + slot hour into the Date.scheduledAt instant.
export const COLOMBIA_UTC_OFFSET_HOURS = 5;
