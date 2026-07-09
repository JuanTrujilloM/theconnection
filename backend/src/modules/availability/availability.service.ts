import {
  BadRequestException,
  GoneException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { MatchesService } from '../matches/matches.service';
import { MIN_VENUE_SELECTION } from '../matches/matches.constants';
import {
  AvailabilityLinkService,
  ValidatedLink,
} from '../availability-link/availability-link.service';
import { CALENDAR_DAYS, TIME_SLOTS } from './availability.constants';
import { SlotSelectionDto } from './dto/submit-availability.dto';

const WEEKDAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MONTHS = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];

@Injectable()
export class AvailabilityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly links: AvailabilityLinkService,
    private readonly matches: MatchesService,
  ) {}

  // State: calendar / places / venues -> selection / feedback.

  // Drives the public availability page. A VENUE-step link means this user has
  // already submitted, so the frontend forwards to place selection.
  async getAvailabilityView(token: string) {
    const link = await this.resolveOrThrow(token);
    if (link.step === 'VENUE') {
      return { step: 'VENUE' as const };
    }
    return {
      step: 'AVAILABILITY' as const,
      partnerName: await this.partnerName(link),
      days: this.buildCalendarDays(),
      timeSlots: [...TIME_SLOTS],
    };
  }

  // Saves this user's slots and advances the link to place selection (HU-06).
  async submitAvailability(token: string, slots: SlotSelectionDto[]) {
    const link = await this.resolveOrThrow(token);
    // A VENUE-step link was already submitted; block a second write (AC #5).
    if (link.step !== 'AVAILABILITY') {
      throw new GoneException('Este enlace ya fue usado.');
    }

    const rows = this.validateSlots(link, slots);

    // Delete-then-insert + advance the step must be atomic: a crash mid-way
    // must not leave partial slots with the link still on the availability step.
    await this.prisma.$transaction([
      this.prisma.availability.deleteMany({
        where: { matchId: link.matchId, userId: link.userId },
      }),
      this.prisma.availability.createMany({ data: rows }),
    ]);
    await this.links.advanceToVenue(link.id);

    return { step: 'VENUE' as const };
  }

  // Drives the public place-selection page (HU-06) for the same token.
  async getVenuesView(token: string) {
    const link = await this.resolveOrThrow(token);
    if (link.step !== 'VENUE') {
      // Availability not submitted yet; frontend sends them back a step.
      return { step: 'AVAILABILITY' as const };
    }
    return {
      step: 'VENUE' as const,
      partnerName: await this.partnerName(link),
      minSelection: MIN_VENUE_SELECTION,
      venues: await this.matches.getVenueSuggestions(link.userId),
    };
  }

  // Records place choices (reusing HU-06 logic) and closes the link.
  async selectVenues(token: string, venueIds: string[]) {
    const link = await this.resolveOrThrow(token);
    if (link.step !== 'VENUE') {
      throw new BadRequestException('Primero elige tus horarios disponibles.');
    }
    const result = await this.matches.selectVenues(link.userId, venueIds);
    await this.links.consume(link.id);
    return { step: 'COMPLETED' as const, ...result };
  }

  // Maps the link result-enum to HTTP so every reason lands on the "invalid
  // link" view (AC #5): unknown -> 404, expired/used -> 410 Gone.
  private async resolveOrThrow(token: string): Promise<ValidatedLink> {
    const result = await this.links.validate(token);
    switch (result.status) {
      case 'ok':
        return result.link;
      case 'expired':
        throw new GoneException('Este enlace ya expiró.');
      case 'consumed':
        throw new GoneException('Este enlace ya fue usado.');
      default:
        throw new NotFoundException('Este enlace no es válido.');
    }
  }

  // Rejects anything outside the calendar the user was shown: unknown slot,
  // a day beyond the 7-day window, or duplicates. Server-side twin of the
  // frontend validation — the endpoint is public, so it can't trust the client.
  private validateSlots(link: ValidatedLink, slots: SlotSelectionDto[]) {
    const allowedDates = new Set(this.calendarDateKeys());
    const allowedTimeSlots = new Set<string>(TIME_SLOTS);
    const seen = new Set<string>();

    return slots.map((slot) => {
      const dateKey = slot.date.slice(0, 10);
      if (!allowedDates.has(dateKey)) {
        throw new BadRequestException('Alguna fecha está fuera del rango.');
      }
      if (!allowedTimeSlots.has(slot.timeSlot)) {
        throw new BadRequestException('Algún horario no es válido.');
      }
      const key = `${dateKey}|${slot.timeSlot}`;
      if (seen.has(key)) {
        throw new BadRequestException('Hay horarios duplicados.');
      }
      seen.add(key);
      return {
        matchId: link.matchId,
        userId: link.userId,
        date: this.dateAtMidnight(dateKey),
        timeSlot: slot.timeSlot,
      };
    });
  }

  private async partnerName(link: ValidatedLink): Promise<string | null> {
    const match = await this.prisma.match.findUnique({
      where: { id: link.matchId },
      include: {
        userA: { include: { profile: { select: { name: true } } } },
        userB: { include: { profile: { select: { name: true } } } },
      },
    });
    if (!match) return null;
    const partner = match.userAId === link.userId ? match.userB : match.userA;
    return partner.profile?.name ?? null;
  }

  // Next 7 days from today, each labeled for the calendar header (e.g. "mié 9 jul").
  private buildCalendarDays() {
    return this.calendarDates().map((date) => ({
      date: this.dateKey(date),
      label: `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`,
    }));
  }

  private calendarDateKeys(): string[] {
    return this.calendarDates().map((date) => this.dateKey(date));
  }

  private calendarDates(): Date[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: CALENDAR_DAYS }, (_, offset) => {
      const day = new Date(today);
      day.setDate(today.getDate() + offset);
      return day;
    });
  }

  // Local YYYY-MM-DD (not toISOString, which would shift the day by the UTC offset).
  private dateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // UTC midnight so the stored @db.Date is exactly the picked calendar day on any
  // server timezone (a local Date would shift the day on positive-offset hosts).
  private dateAtMidnight(dateKey: string): Date {
    const [year, month, day] = dateKey.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }
}
