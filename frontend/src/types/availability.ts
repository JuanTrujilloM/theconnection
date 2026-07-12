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

// GET /availability/:token. A VENUE step means places are not chosen yet, so
// the page forwards to that step first. COMPLETED = the link was consumed.
export type AvailabilityView =
  | {
      step: 'AVAILABILITY';
      partnerName: string | null;
      days: CalendarDay[];
      timeSlots: string[];
    }
  | { step: 'VENUE' }
  | { step: 'COMPLETED' };

// GET /availability/:token/venues — step 1 of the flow. An AVAILABILITY step
// means places are already chosen, so the page forwards to time selection.
export type TokenVenuesView =
  | {
      step: 'VENUE';
      partnerName: string | null;
      minSelection: number;
      venues: VenueSuggestion[];
    }
  | { step: 'AVAILABILITY' }
  | { step: 'COMPLETED' };
