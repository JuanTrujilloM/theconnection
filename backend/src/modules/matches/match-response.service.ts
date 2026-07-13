import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../config/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ACTIVE_MATCH_STATUSES } from '../chatbot/user-context/match-status';
import {
  REJECTED_MATCH_STATUS,
  RESPONSE_TIMEOUT_CRON,
  RESPONSE_TIMEOUT_HOURS,
} from './match-response.constants';

export type RejectResult = 'rejected' | 'no_active_match';

// HU-07: a user can reject their weekly match by telling the chatbot. Acceptance
// is implicit (completing the availability + place flow), so only rejection and
// the 48h no-response timeout are recorded here. Both end the match and recycle
// the pair into the next weekly cycle.
@Injectable()
export class MatchResponseService {
  private readonly logger = new Logger(MatchResponseService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  // Chatbot-driven rejection. rejectedById records who declined (AC #6); the
  // other user is notified and both return to the pool.
  async reject(userId: string): Promise<RejectResult> {
    const match = await this.prisma.match.findFirst({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        status: { in: [...ACTIVE_MATCH_STATUSES] },
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true, userAId: true, userBId: true },
    });
    if (!match) return 'no_active_match';

    const otherUserId =
      match.userAId === userId ? match.userBId : match.userAId;
    await this.terminate(match.id, userId);
    await this.notifyRejected(otherUserId);
    return 'rejected';
  }

  // AC #5: no response 48h after the first notification is treated as a rejection.
  // "Complete" here = a scheduled date exists; anything else at the deadline is a
  // no/partial response. rejectedById stays null to mark a system timeout.
  @Cron(RESPONSE_TIMEOUT_CRON)
  async rejectStaleMatches(): Promise<void> {
    const cutoff = new Date(Date.now() - RESPONSE_TIMEOUT_HOURS * 3600 * 1000);
    const stale = await this.prisma.match.findMany({
      where: {
        status: { in: [...ACTIVE_MATCH_STATUSES] },
        date: { is: null },
        createdAt: { lt: cutoff },
      },
      select: { id: true, userAId: true, userBId: true },
    });

    for (const match of stale) {
      try {
        await this.terminate(match.id, null);
        await Promise.all([
          this.notifyRejected(match.userAId),
          this.notifyRejected(match.userBId),
        ]);
      } catch (error) {
        this.logger.error(
          `Failed to time out match ${match.id}`,
          error as Error,
        );
      }
    }
  }

  // Marks the match rejected and drops any half-built date so a recycled match
  // never keeps a stale schedule.
  private async terminate(
    matchId: string,
    rejectedById: string | null,
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.date.deleteMany({ where: { matchId } }),
      this.prisma.match.update({
        where: { id: matchId },
        data: {
          status: REJECTED_MATCH_STATUS,
          rejectedById,
          rejectedAt: new Date(),
        },
      }),
    ]);
  }

  private async notifyRejected(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        cellphone: true,
        profile: { select: { name: true } },
      },
    });
    if (!user) return;
    await this.notifications.notifyMatchRejected({
      name: user.profile?.name ?? '',
      email: user.email,
      cellphone: user.cellphone,
    });
  }
}
