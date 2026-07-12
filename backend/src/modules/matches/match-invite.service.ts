import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
import { AvailabilityLinkService } from '../availability-link/availability-link.service';
import { WhatsappNotifierService } from '../whatsapp/whatsapp-notifier.service';
import { MatchPair } from './engine/types';

export interface InviteResult {
  userId: string;
  cellphone: string;
  url: string;
}

// Match with the fields the invite needs: each user's cellphone (WhatsApp) and
// the partner's display name.
type MatchWithUsers = {
  id: string;
  userAId: string;
  userBId: string;
  userA: InviteUser;
  userB: InviteUser;
};
type InviteUser = {
  id: string;
  cellphone: string;
  profile: { name: string } | null;
};

// HU-05: turns a freshly generated match into the first WhatsApp notification —
// a tokenized availability link per user. Separate from the matching engine so
// a notification failure never rolls back a match that was already persisted.
@Injectable()
export class MatchInviteService {
  private readonly logger = new Logger(MatchInviteService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly links: AvailabilityLinkService,
    private readonly notifier: WhatsappNotifierService,
  ) {}

  // Cron path: invite both users of every pair created this cycle.
  async inviteForPairs(pairs: MatchPair[]): Promise<void> {
    for (const pair of pairs) {
      const match = await this.findMatch(pair.userAId, pair.userBId);
      if (!match) continue;
      await this.inviteForMatch(match.id);
    }
  }

  // Issues a link per user, sends (or dev-logs) the invite, and returns the URLs
  // so scripts can print them. Per-user try/catch: one bad send can't block the other.
  async inviteForMatch(matchId: string): Promise<InviteResult[]> {
    const match = await this.loadMatch(matchId);
    if (!match) return [];

    const results: InviteResult[] = [];
    for (const [user, partner] of [
      [match.userA, match.userB],
      [match.userB, match.userA],
    ] as const) {
      try {
        results.push(await this.inviteUser(match.id, user, partner));
      } catch (error) {
        this.logger.error(
          `Failed to send availability invite to user ${user.id}`,
          error as Error,
        );
      }
    }
    return results;
  }

  private async inviteUser(
    matchId: string,
    user: InviteUser,
    partner: InviteUser,
  ): Promise<InviteResult> {
    const token = await this.links.issueForMatchUser(matchId, user.id);
    // Entry point is place selection (HU-06); time selection (HU-09) follows.
    const url = `${this.frontendUrl()}/flow/${token}/places`;
    await this.notifier.sendAvailabilityInvite({
      cellphone: user.cellphone,
      partnerName: partner.profile?.name ?? 'tu match',
      availabilityUrl: url,
    });
    return { userId: user.id, cellphone: user.cellphone, url };
  }

  private async findMatch(
    userAId: string,
    userBId: string,
  ): Promise<{ id: string } | null> {
    return this.prisma.match.findFirst({
      where: { userAId, userBId },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });
  }

  private async loadMatch(matchId: string): Promise<MatchWithUsers | null> {
    return this.prisma.match.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        userAId: true,
        userBId: true,
        userA: this.inviteUserSelect(),
        userB: this.inviteUserSelect(),
      },
    });
  }

  private inviteUserSelect() {
    return {
      select: {
        id: true,
        cellphone: true,
        profile: { select: { name: true } },
      },
    };
  }

  private frontendUrl(): string {
    return this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
  }
}
