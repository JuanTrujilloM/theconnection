// HU-09: the availability calendar shows 7 days with 1-hour slots from 12:00pm to
// 7:00pm. The window starts the day after the match was created (not "today"), so a
// matching run offers the following days — see AvailabilityService.calendarDates.
// timeSlot is the slot's start hour (matches the seed format and the frontend
// calendar). 12..18 start hours = seven 1-hour slots ending 7pm.
export const CALENDAR_DAYS = 7;

export const TIME_SLOTS = [
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
] as const;

export type TimeSlot = (typeof TIME_SLOTS)[number];

// Acceptance #3: at least one slot is required to submit.
export const MIN_SLOTS = 1;
