import type { VenueSuggestion } from './venue';

// HU-09 calendar cell header: a day in the next-7-days window.
export interface CalendarDay {
  date: string; // YYYY-MM-DD
  label: string; // e.g. "mié 9 jul"
}

// One selected slot: a day + the slot's start hour ("12:00".."18:00").
export interface SlotSelection {
  date: string;
  timeSlot: string;
}

// GET /availability/:token. A VENUE step means availability is already saved,
// so the page forwards to place selection.
export type AvailabilityView =
  | {
      step: 'AVAILABILITY';
      partnerName: string | null;
      days: CalendarDay[];
      timeSlots: string[];
    }
  | { step: 'VENUE' };

// GET /availability/:token/venues. An AVAILABILITY step means the user hasn't
// submitted slots yet, so the page forwards back a step.
export type TokenVenuesView =
  | {
      step: 'VENUE';
      partnerName: string | null;
      minSelection: number;
      venues: VenueSuggestion[];
    }
  | { step: 'AVAILABILITY' };
