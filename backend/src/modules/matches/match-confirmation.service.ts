import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
import { AvailabilityLinkService } from '../availability-link/availability-link.service';
import { WhatsappNotifierService } from '../whatsapp/whatsapp-notifier.service';
import { ACTIVE_MATCH_STATUSES } from '../chatbot/user-context/match-status';
import { MIN_VENUE_SELECTION } from './matches.constants';
import {
  COLOMBIA_UTC_OFFSET_HOURS,
  CONFIRMED_MATCH_STATUS,
  DATE_ACCEPTED_STATUS,
  EXPIRED_MATCH_STATUS,
  MAX_SCHEDULE_ATTEMPTS,
  RECYCLE_CRON,
  SCHEDULE_DEADLINE_HOURS,
} from './match-confirmation.constants';

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

export type ConfirmResult =
  | 'confirmed'
  | 'nudged'
  | 'recycled'
  | 'waiting'
  | 'already_scheduled';

// HU-08: once both users have picked availability AND places, look for a common
// time slot (places always overlap — each picks exactly 2 of 3). If one exists,
// create the Date awaiting confirmation. If not, nudge once for more availability,
// then recycle the match to the next weekly cycle.
@Injectable()
export class MatchConfirmationService {
  private readonly logger = new Logger(MatchConfirmationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly links: AvailabilityLinkService,
    private readonly notifier: WhatsappNotifierService,
  ) {}

  // Called after a user finishes place selection. A no-op until both sides are
  // complete; safe to call repeatedly.
  async tryConfirm(matchId: string): Promise<ConfirmResult> {
    const match = await this.loadMatch(matchId);
    if (!match) return 'waiting';
    if (match.date) return 'already_scheduled';
    if (!(ACTIVE_MATCH_STATUSES as readonly string[]).includes(match.status)) {
      return 'already_scheduled';
    }
    if (!this.bothCompleted(match)) return 'waiting';

    const slot = this.earliestCommonSlot(match);
    const venueId = this.commonVenueId(match);
    if (slot && venueId) {
      return this.createDate(match, slot, venueId);
    }
    return this.handleNoOverlap(match);
  }

  // Hourly sweep: a match that was nudged but still has no date past its deadline
  // is recycled so both users re-enter the next weekly pool.
  @Cron(RECYCLE_CRON)
  async recycleExpired(): Promise<void> {
    const overdue = await this.prisma.match.findMany({
      where: {
        status: { in: [...ACTIVE_MATCH_STATUSES] },
        date: { is: null },
        scheduleDeadline: { lt: new Date() },
      },
      select: { id: true },
    });
    for (const { id } of overdue) {
      const match = await this.loadMatch(id);
      if (match) await this.recycle(match);
    }
  }

  private async createDate(
    match: LoadedMatch,
    slot: CommonSlot,
    venueId: string,
  ): Promise<ConfirmResult> {
    try {
      // Create the date and confirm the match together: a match with a scheduled
      // date is confirmed. Date.matchId is unique, so a concurrent confirm rolls
      // the whole transaction back and lands in the catch.
      await this.prisma.$transaction([
        this.prisma.date.create({
          data: {
            matchId: match.id,
            venueId,
            scheduledAt: slot.scheduledAt,
            status: DATE_ACCEPTED_STATUS,
          },
        }),
        this.prisma.match.update({
          where: { id: match.id },
          data: { status: CONFIRMED_MATCH_STATUS },
        }),
      ]);
    } catch {
      return 'already_scheduled';
    }

    const venueName = this.venueNameById(match, venueId);
    const whenText = slot.label;
    await Promise.all([
      this.notifier.sendDateProposal({
        cellphone: match.userA.cellphone,
        partnerName: nameOf(match.userB),
        whenText,
        venueName,
      }),
      this.notifier.sendDateProposal({
        cellphone: match.userB.cellphone,
        partnerName: nameOf(match.userA),
        whenText,
        venueName,
      }),
    ]);
    return 'confirmed';
  }

  private async handleNoOverlap(match: LoadedMatch): Promise<ConfirmResult> {
    // Already nudged once with no result -> stop retrying and recycle.
    if (match.scheduleAttempts >= MAX_SCHEDULE_ATTEMPTS) {
      return this.recycle(match);
    }

    await this.prisma.match.update({
      where: { id: match.id },
      data: {
        scheduleAttempts: { increment: 1 },
        scheduleDeadline: new Date(
          Date.now() + SCHEDULE_DEADLINE_HOURS * 60 * 60 * 1000,
        ),
      },
    });

    // Re-open availability for both: a fresh AVAILABILITY-step link each.
    for (const [user, partner] of [
      [match.userA, match.userB],
      [match.userB, match.userA],
    ] as const) {
      const token = await this.links.issueForMatchUser(match.id, user.id);
      await this.notifier.sendMoreAvailabilityRequest({
        cellphone: user.cellphone,
        partnerName: nameOf(partner),
        availabilityUrl: `${this.frontendUrl()}/availability/${token}`,
      });
    }
    return 'nudged';
  }

  private async recycle(match: LoadedMatch): Promise<ConfirmResult> {
    await this.prisma.match.update({
      where: { id: match.id },
      data: { status: EXPIRED_MATCH_STATUS },
    });
    await Promise.all([
      this.notifier.sendReschedulingFailed(match.userA.cellphone),
      this.notifier.sendReschedulingFailed(match.userB.cellphone),
    ]);
    return 'recycled';
  }

  // Both users must have submitted availability and selected the required places.
  private bothCompleted(match: LoadedMatch): boolean {
    const hasAvailability = (userId: string) =>
      match.availabilities.some((a) => a.userId === userId);
    const venueCount = (
      pick: (o: LoadedMatch['venueOptions'][number]) => boolean,
    ) => match.venueOptions.filter(pick).length;

    return (
      hasAvailability(match.userAId) &&
      hasAvailability(match.userBId) &&
      venueCount((o) => o.userASelected) >= MIN_VENUE_SELECTION &&
      venueCount((o) => o.userBSelected) >= MIN_VENUE_SELECTION
    );
  }

  // Earliest slot present in BOTH users' availability, as a scheduledAt instant.
  private earliestCommonSlot(match: LoadedMatch): CommonSlot | null {
    const keysB = new Set(
      match.availabilities
        .filter((a) => a.userId === match.userBId)
        .map(slotKey),
    );
    const common = match.availabilities
      .filter((a) => a.userId === match.userAId && keysB.has(slotKey(a)))
      .sort((a, b) => this.slotInstant(a) - this.slotInstant(b));

    const first = common[0];
    if (!first) return null;
    return {
      scheduledAt: new Date(this.slotInstant(first)),
      label: this.slotLabel(first),
    };
  }

  // Places always overlap once both picked 2 of 3, but guard anyway.
  private commonVenueId(match: LoadedMatch): string | null {
    const shared = match.venueOptions.find(
      (o) => o.userASelected && o.userBSelected,
    );
    return shared?.venueId ?? null;
  }

  private venueNameById(match: LoadedMatch, venueId: string): string {
    const option = match.venueOptions.find((o) => o.venueId === venueId);
    return option?.venue.name ?? 'el lugar acordado';
  }

  // A slot's calendar day (stored UTC-midnight) + local hour -> UTC instant (ms).
  private slotInstant(slot: SlotRow): number {
    const date = slot.date;
    const hour = Number(slot.timeSlot.slice(0, 2));
    return Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      hour + COLOMBIA_UTC_OFFSET_HOURS,
    );
  }

  private slotLabel(slot: SlotRow): string {
    const date = slot.date;
    return `${WEEKDAYS[date.getUTCDay()]} ${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} · ${slot.timeSlot}`;
  }

  // Not private: LoadedMatch derives its type from this method's return.
  loadMatch(matchId: string) {
    return this.prisma.match.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        userAId: true,
        userBId: true,
        status: true,
        scheduleAttempts: true,
        date: { select: { id: true } },
        availabilities: {
          select: { userId: true, date: true, timeSlot: true },
        },
        venueOptions: {
          select: {
            venueId: true,
            userASelected: true,
            userBSelected: true,
            venue: { select: { name: true } },
          },
        },
        userA: {
          select: {
            id: true,
            cellphone: true,
            profile: { select: { name: true } },
          },
        },
        userB: {
          select: {
            id: true,
            cellphone: true,
            profile: { select: { name: true } },
          },
        },
      },
    });
  }

  private frontendUrl(): string {
    return this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
  }
}

type LoadedMatch = NonNullable<
  Awaited<ReturnType<MatchConfirmationService['loadMatch']>>
>;
type SlotRow = { userId: string; date: Date; timeSlot: string };
interface CommonSlot {
  scheduledAt: Date;
  label: string;
}

function slotKey(slot: { date: Date; timeSlot: string }): string {
  return `${slot.date.toISOString().slice(0, 10)}|${slot.timeSlot}`;
}

function nameOf(user: { profile: { name: string } | null }): string {
  return user.profile?.name ?? 'tu match';
}
