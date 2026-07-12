// HU-07 accept/reject.

// Terminal status for a match a user declined (or that timed out). Leaving the
// active set (pending/confirmed) frees both users for the next weekly cycle.
export const REJECTED_MATCH_STATUS = 'rejected';

// No response within this window from the first notification is treated as a
// rejection (AC #5). Measured from Match.createdAt (the invite fires on create).
export const RESPONSE_TIMEOUT_HOURS = 48;

// Hourly sweep that rejects matches whose 48h response window lapsed.
export const RESPONSE_TIMEOUT_CRON = '0 * * * *';
